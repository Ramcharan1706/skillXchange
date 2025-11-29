import React, { useState, useMemo, useEffect, useReducer } from 'react'
import { useSnackbar } from 'notistack'
import { useWallet } from '@txnlab/use-wallet-react'
import { AlgorandClient, algo } from '@algorandfoundation/algokit-utils'
import {
  getAlgodConfigFromViteEnvironment,
  getIndexerConfigFromViteEnvironment,
} from '../utils/network/getAlgoClientConfigs'
import algosdk from 'algosdk'
import TimeSlotSelector from './TimeSlotSelector'
import { createNFT } from '../utils/nftUtils'

interface BookingModalProps {
  openModal: boolean
  setModalState: (value: boolean) => void
  skillId: number
  initialSkillRate: number
  selectedSlot: { slot: string; link: string }
  algorand: AlgorandClient | null
  activeAddress: string | undefined
  onBookingSuccess?: (skillId: number, slot: string) => void
  defaultReceiver?: string
  timeSlots?: { time: string; meetLink: string }[]
}

interface TimeSlot {
  time: string
  meetLink: string
}

interface BookingState {
  loading: boolean
  bookingConfirmed: boolean
  bookingError: string | null
}

type BookingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONFIRMED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

const bookingReducer = (state: BookingState, action: BookingAction): BookingState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_CONFIRMED':
      return { ...state, bookingConfirmed: action.payload }
    case 'SET_ERROR':
      return { ...state, bookingError: action.payload }
    default:
      return state
  }
}

const DEFAULT_RECEIVER =
  '2ZTFJNDXPWDETGJQQN33HAATRHXZMBWESKO2AUFZUHERH2H3TG4XTNPL4Y'

const BookingModal: React.FC<BookingModalProps> = ({
  openModal,
  setModalState,
  skillId,
  initialSkillRate,
  selectedSlot,
  algorand,
  activeAddress,
  onBookingSuccess,
  defaultReceiver = DEFAULT_RECEIVER,
  timeSlots: propTimeSlots,
}) => {
  const [skillRate, setSkillRate] = useState<number>(initialSkillRate || 0)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)
  const [receiverAddress, setReceiverAddress] = useState<string>(defaultReceiver)
  const [bookingState, dispatch] = useReducer(bookingReducer, {
    loading: false,
    bookingConfirmed: false,
    bookingError: null,
  })

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner } = useWallet()

  const totalPayment = skillRate
  const isSkillRateValid = skillRate > 0
  const isReceiverValid = algosdk.isValidAddress(receiverAddress)

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()

  const client = useMemo(() => {
    if (algorand) {
      const c = algorand
      if (transactionSigner) c.setDefaultSigner(transactionSigner)
      return c
    }
    return null
  }, [algorand, transactionSigner])

  /** ---------------- TIME SLOTS ---------------- */
  const defaultTimeSlots: TimeSlot[] = [
    { time: '10:00 AM', meetLink: 'https://meet.google.com/new-1010-session' },
    { time: '12:00 PM', meetLink: 'https://meet.google.com/new-1200-session' },
    { time: '2:00 PM', meetLink: 'https://meet.google.com/new-1400-session' },
    { time: '4:00 PM', meetLink: 'https://meet.google.com/new-1600-session' },
  ]
  const timeSlots = propTimeSlots || defaultTimeSlots

  // Automatically assign a default slot once booking is confirmed
  useEffect(() => {
    if (bookingState.bookingConfirmed && !selectedTimeSlot) {
      setSelectedTimeSlot(timeSlots[0])
    }
  }, [bookingState.bookingConfirmed, selectedTimeSlot, timeSlots])

  // Reset state when modal opens
  useEffect(() => {
    if (openModal) {
      setSelectedTimeSlot(null)
      dispatch({ type: 'SET_CONFIRMED', payload: false })
      dispatch({ type: 'SET_ERROR', payload: null })
    }
  }, [openModal])

  /** ---------------- PAYMENT METHODS ---------------- */
  /**
   * Sends payment using the connected wallet signer.
   * @returns Promise<string> - Transaction ID
   */
  const sendPayment = async (): Promise<string> => {
    if (!transactionSigner || !activeAddress || !client) {
      const errorMsg = 'Please connect your wallet.'
      enqueueSnackbar(errorMsg, { variant: 'warning' })
      return Promise.reject(errorMsg)
    }

    try {
      enqueueSnackbar(`Sending ${totalPayment.toFixed(3)} ALGO...`, { variant: 'info' })

      const result = await client!.send.payment({
        sender: activeAddress,
        receiver: receiverAddress,
        amount: algo(totalPayment),
        signer: transactionSigner,
      })

      enqueueSnackbar(`✅ Payment successful! TxID: ${result.txIds[0]}`, { variant: 'success' })
      return result.txIds[0]
    } catch (error: any) {
      const errorMsg = `Payment failed: ${error.message || error}`
      enqueueSnackbar(errorMsg, { variant: 'error' })
      throw new Error(errorMsg)
    }
  }

  /** ---------------- HANDLE BOOKING ---------------- */
  /**
   * Handles the booking process including validation and payment.
   */
  const handleBookSession = async () => {
    if (!activeAddress || !transactionSigner) {
      dispatch({ type: 'SET_ERROR', payload: 'Please connect your wallet and ensure it is active.' })
      return
    }
    if (!isReceiverValid) {
      dispatch({ type: 'SET_ERROR', payload: 'Invalid receiver address.' })
      return
    }
    if (!isSkillRateValid) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter a valid skill rate.' })
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })
    try {
      await sendPayment()
      enqueueSnackbar('Booking your session...', { variant: 'info' })
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate booking delay

      // Award NFT for booking - Create real NFT asset
      try {
        const assetId = await createNFT(activeAddress!, transactionSigner, client!, skillId)
        if (assetId) {
          console.log(`NFT Asset created with ID: ${assetId} for wallet: ${activeAddress}`)
          enqueueSnackbar(`🎨 NFT Asset #${assetId} created and stored in your wallet!`, { variant: 'success' })
          enqueueSnackbar(`🎁 Check your profile to view this NFT in your collection!`, { variant: 'info' })
        } else {
          enqueueSnackbar('NFT creation failed, but booking was successful.', { variant: 'warning' })
        }
      } catch (error) {
        console.error('Failed to create NFT:', error)
        enqueueSnackbar('NFT creation failed, but booking was successful.', { variant: 'warning' })
      }

      dispatch({ type: 'SET_CONFIRMED', payload: true })
      enqueueSnackbar(`🎉 Your session has been successfully booked!`, {
        variant: 'success',
      })
      if (onBookingSuccess) {
        onBookingSuccess(skillId, selectedSlot.slot)
      }
    } catch (error: any) {
      const errorMessage = error.message || error || 'Unknown error occurred'
      dispatch({ type: 'SET_ERROR', payload: `Booking failed: ${errorMessage}` })
      enqueueSnackbar(`❌ Booking failed: ${errorMessage}`, { variant: 'error' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  if (!openModal) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title" id="booking_modal_title">
            🚀 Book a Session
          </h3>
          <button
            onClick={() => setModalState(false)}
            className="modal-close"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!bookingState.loading) handleBookSession()
            }}
            aria-labelledby="booking_modal_title"
          >
            {/* Skill Info */}
            <div className="form-group">
              <label className="form-label">🎯 Skill ID</label>
              <div className="card p-4 text-center">
                <span className="text-xl font-bold">{skillId}</span>
              </div>
            </div>

            {/* Selected Slot */}
            <div className="form-group">
              <label className="form-label">📅 Selected Slot</label>
              <div className="card p-4">
                <span className="font-semibold select-all">{selectedSlot.slot}</span>
              </div>
            </div>

            {/* Receiver */}
            <div className="form-group">
              <label htmlFor="receiver-address" className="form-label">
                🏠 Receiver Address
              </label>
              <input
                id="receiver-address"
                type="text"
                value={receiverAddress}
                onChange={(e) => {
                  setReceiverAddress(e.target.value.trim())
                  dispatch({ type: 'SET_ERROR', payload: null })
                }}
                className={`form-input ${!isReceiverValid && receiverAddress !== '' ? 'border-red-400' : ''}`}
                disabled={bookingState.loading || bookingState.bookingConfirmed}
                placeholder="Enter Algorand address"
                aria-describedby="receiver-error"
              />
            </div>

            {/* Skill Rate (Fixed) */}
            <div className="form-group">
              <label className="form-label">💰 Skill Rate (ALGO/hr)</label>
              <div className="card p-4">
                <span className="text-xl font-bold">{skillRate.toFixed(3)}</span>
              </div>
            </div>

            {/* Error Message */}
            {bookingState.bookingError && (
              <div
                id="receiver-error"
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
                role="alert"
              >
                <p className="text-red-700 font-bold">❌ {bookingState.bookingError}</p>
              </div>
            )}

            {/* Total and Book Button */}
            <div className="card p-6 mt-6">
              <div className="flex justify-between items-center">
                <strong className="text-2xl">💎 Total: {totalPayment.toFixed(3)} ALGO</strong>
                <button
                  type="submit"
                  disabled={bookingState.loading || bookingState.bookingConfirmed}
                  className="btn btn-primary btn-lg"
                  aria-label={
                    bookingState.loading
                      ? 'Processing payment'
                      : bookingState.bookingConfirmed
                      ? 'Booking confirmed'
                      : 'Pay and book session'
                  }
                >
                  {bookingState.loading
                    ? '🔄 Processing...'
                    : bookingState.bookingConfirmed
                    ? '✅ Booked'
                    : '✨ Pay & Book'}
                </button>
              </div>
            </div>

            {/* ---------------- SHOW SLOTS ONLY AFTER BOOKING CONFIRMATION ---------------- */}
            {bookingState.bookingConfirmed && (
              <div className="card mt-6">
                <h4 className="text-2xl font-bold mb-4">🎉 Booking Confirmed!</h4>
                <p className="text-lg mb-4">
                  You can now select your session time or join directly:
                </p>

                {/* Time Slots (now visible only after booking) */}
                <TimeSlotSelector
                  timeSlots={timeSlots}
                  selectedTimeSlot={selectedTimeSlot}
                  onSelectSlot={setSelectedTimeSlot}
                />

                {selectedTimeSlot && (
                  <div className="card mt-4">
                    <p className="text-lg mb-2">
                      ✅ Selected Slot: <strong>{selectedTimeSlot.time}</strong>
                    </p>
                    <p className="text-sm text-muted mb-4">
                      Your meeting link is ready. You can join the session or share the link below.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => window.open(selectedTimeSlot.meetLink, '_blank')}
                        className="btn btn-primary"
                        aria-label={`Join meeting at ${selectedTimeSlot.time}`}
                      >
                        🔗 Join Meeting
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(selectedTimeSlot.meetLink)
                            enqueueSnackbar('Link copied to clipboard!', { variant: 'success' })
                          } catch (err) {
                            enqueueSnackbar('Failed to copy link', { variant: 'error' })
                          }
                        }}
                        className="btn btn-outline"
                        aria-label="Copy meeting link to clipboard"
                      >
                        📋 Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Close Button */}
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setModalState(false)}
                className="btn btn-outline"
                disabled={bookingState.loading}
                aria-label={bookingState.bookingConfirmed ? 'Close modal' : 'Cancel booking'}
              >
                {bookingState.bookingConfirmed ? '✨ Close' : '🚫 Cancel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BookingModal
