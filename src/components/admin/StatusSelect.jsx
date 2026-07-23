import { useDispatch } from 'react-redux'
import { ChevronDown } from 'lucide-react'
import {
  ORDER_STAGES,
  REJECTION_REASONS,
  rejectOrder,
  setOrderStage,
  statusOf,
} from '../../store/orderSlice'

const TONE = {
  awaiting: 'warn',
  progress: 'live',
  completed: 'done',
  declined: 'declined',
}

// The status control that appears on every order row. Picking a stage sets it
// directly; picking "Declined" turns the order away with the default reason
// (the live ticket offers the full list of reasons).
export default function StatusSelect({ order }) {
  const dispatch = useDispatch()
  const tone = TONE[statusOf(order)]

  const change = (value) => {
    if (value === 'declined') {
      dispatch(rejectOrder({ id: order.id, reason: REJECTION_REASONS[0] }))
    } else {
      dispatch(setOrderStage({ id: order.id, stage: Number(value) }))
    }
  }

  return (
    <span className={`status-select tone-${tone}`}>
      <select
        value={order.rejected ? 'declined' : String(order.stageIndex)}
        onChange={(e) => change(e.target.value)}
        aria-label={`Status for order ${order.id}`}
      >
        {ORDER_STAGES.map((stage, i) => (
          <option key={stage.key} value={i}>
            {stage.short}
          </option>
        ))}
        <option value="declined">Declined</option>
      </select>
      <ChevronDown aria-hidden="true" />
    </span>
  )
}
