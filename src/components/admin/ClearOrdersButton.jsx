import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Check, Trash2 } from 'lucide-react'
import { clearOrders } from '../../store/orderSlice'

// Wiping the book is destructive and cannot be undone, so it takes two clicks.
// The armed state disarms itself after a few seconds.
export default function ClearOrdersButton({ disabled }) {
  const dispatch = useDispatch()
  const [armed, setArmed] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const onClick = () => {
    if (!armed) {
      setArmed(true)
      timer.current = setTimeout(() => setArmed(false), 4000)
      return
    }
    clearTimeout(timer.current)
    setArmed(false)
    dispatch(clearOrders())
  }

  return (
    <button
      className={`btn btn-sm ${armed ? 'btn-primary' : 'btn-outline'}`}
      onClick={onClick}
      disabled={disabled}
    >
      {armed ? <Check aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
      {armed ? 'Tap again to confirm' : 'Clear orders'}
    </button>
  )
}
