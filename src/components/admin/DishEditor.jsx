import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { AlertCircle, ImageOff, Link2, Loader2, Trash2, Upload, X } from 'lucide-react'
import { CATEGORIES } from '../../data/menu'
import { addDish, removeDish, updateDish } from '../../store/menuSlice'
import { approxKb, fileToDataUrl, isDataUrl } from '../../utils/imageFile'

const BLANK = {
  name: '',
  category: 'pizza',
  price: '',
  description: '',
  image: '',
  tags: '',
}

// "Vegetarian, Spicy" <-> ['Vegetarian', 'Spicy']
const parseTags = (raw) =>
  raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 4)

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Every dish needs a name.'
  const price = Number.parseFloat(String(form.price).replace(',', '.'))
  if (!Number.isFinite(price) || price <= 0 || price > 999) errors.price = 'Enter a price in euro.'
  if (!form.description.trim()) errors.description = 'A line about it goes on the menu card.'
  return errors
}

export default function DishEditor({ dish, onClose }) {
  const dispatch = useDispatch()
  const isNew = !dish
  const firstField = useRef(null)

  const [form, setForm] = useState(() =>
    dish
      ? {
          name: dish.name,
          category: dish.category,
          price: dish.price.toFixed(2),
          description: dish.description,
          image: dish.image ?? '',
          tags: (dish.tags ?? []).join(', '),
        }
      : BLANK,
  )
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [imageBroken, setImageBroken] = useState(false)
  // An existing dish that already has an uploaded photo opens on the file tab.
  const [source, setSource] = useState(() => (isDataUrl(dish?.image) ? 'file' : 'url'))
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef(null)

  const takeFile = async (file) => {
    if (!file) return
    setUploading(true)
    setErrors((prev) => ({ ...prev, image: undefined }))
    try {
      const dataUrl = await fileToDataUrl(file)
      setForm((prev) => ({ ...prev, image: dataUrl }))
      setImageBroken(false)
    } catch (err) {
      setErrors((prev) => ({ ...prev, image: err.message }))
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    firstField.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const update = (key) => (e) => {
    const { value } = e.target
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    if (key === 'image') setImageBroken(false)
  }

  const submit = (e) => {
    e.preventDefault()
    const found = validate(form)
    if (Object.keys(found).length) {
      setErrors(found)
      return
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Math.round(Number.parseFloat(String(form.price).replace(',', '.')) * 100) / 100,
      description: form.description.trim(),
      image: form.image.trim(),
      tags: parseTags(form.tags),
    }

    dispatch(isNew ? addDish(payload) : updateDish({ id: dish.id, ...payload }))
    onClose()
  }

  const remove = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    dispatch(removeDish(dish.id))
    onClose()
  }

  return (
    <motion.div
      className="modal-scrim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? 'Add a dish' : `Edit ${dish.name}`}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.99 }}
        transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <div className="modal-head">
          <div>
            <h2>{isNew ? 'Add a dish' : 'Edit dish'}</h2>
            <p>{isNew ? 'It goes straight onto the menu.' : 'Changes show on the site immediately.'}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" />
          </button>
        </div>

        <form className="modal-body" onSubmit={submit} noValidate>
          <div className="editor-grid">
            <div>
              <div className="field">
                <label htmlFor="dish-name">Name</label>
                <input
                  id="dish-name"
                  ref={firstField}
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Margherita"
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && (
                  <p className="field-error">
                    <AlertCircle aria-hidden="true" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="field-grid">
                <div className="field">
                  <label htmlFor="dish-category">Category</label>
                  <select id="dish-category" value={form.category} onChange={update('category')}>
                    {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="dish-price">Price (€)</label>
                  <input
                    id="dish-price"
                    inputMode="decimal"
                    value={form.price}
                    onChange={update('price')}
                    placeholder="8.50"
                    aria-invalid={Boolean(errors.price)}
                  />
                  {errors.price && (
                    <p className="field-error">
                      <AlertCircle aria-hidden="true" />
                      {errors.price}
                    </p>
                  )}
                </div>
              </div>

              <div className="field">
                <label htmlFor="dish-description">Description</label>
                <textarea
                  id="dish-description"
                  value={form.description}
                  onChange={update('description')}
                  placeholder="San Marzano tomato, fior di latte, basil picked to order."
                  aria-invalid={Boolean(errors.description)}
                />
                {errors.description && (
                  <p className="field-error">
                    <AlertCircle aria-hidden="true" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="dish-tags">Tags</label>
                <input
                  id="dish-tags"
                  value={form.tags}
                  onChange={update('tags')}
                  placeholder="Vegetarian, Signature"
                />
                <p className="field-note">
                  Separated by commas, up to four. “Signature” and “Spicy” get a badge on the photo.
                </p>
              </div>
            </div>

            <div>
              <div className="field">
                <label>Photo</label>

                <div className="seg" role="tablist" aria-label="Photo source">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={source === 'file'}
                    className={source === 'file' ? 'on' : ''}
                    onClick={() => setSource('file')}
                  >
                    <Upload aria-hidden="true" />
                    From my device
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={source === 'url'}
                    className={source === 'url' ? 'on' : ''}
                    onClick={() => setSource('url')}
                  >
                    <Link2 aria-hidden="true" />
                    Link
                  </button>
                </div>

                {source === 'url' ? (
                  <>
                    <input
                      id="dish-image"
                      value={isDataUrl(form.image) ? '' : form.image}
                      onChange={update('image')}
                      placeholder="https://…"
                    />
                    <p className="field-note">Paste a link to a photo that is already online.</p>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`dropzone ${dragging ? 'over' : ''}`}
                      onClick={() => fileInput.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragging(true)
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setDragging(false)
                        takeFile(e.dataTransfer.files?.[0])
                      }}
                    >
                      {uploading ? (
                        <>
                          <Loader2 aria-hidden="true" className="spin" />
                          <b>Preparing the photo…</b>
                        </>
                      ) : (
                        <>
                          <Upload aria-hidden="true" />
                          <b>Choose a photo</b>
                          <span>or drag one here · JPG, PNG or WebP</span>
                        </>
                      )}
                    </button>
                    <input
                      ref={fileInput}
                      id="dish-image"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        takeFile(e.target.files?.[0])
                        e.target.value = '' // let the same file be picked twice
                      }}
                    />
                    <p className="field-note">
                      Photos are resized and stored in the browser, so keep them to a few per menu
                      until there is a server to hold them.
                    </p>
                  </>
                )}

                {errors.image && (
                  <p className="field-error">
                    <AlertCircle aria-hidden="true" />
                    {errors.image}
                  </p>
                )}
              </div>

              <div className="image-preview">
                {form.image && !imageBroken ? (
                  <>
                    <img src={form.image} alt="" onError={() => setImageBroken(true)} />
                    <button
                      type="button"
                      className="image-clear"
                      onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                      aria-label="Remove photo"
                    >
                      <X aria-hidden="true" />
                    </button>
                    {isDataUrl(form.image) && (
                      <span className="image-size">Uploaded · {approxKb(form.image)} KB</span>
                    )}
                  </>
                ) : (
                  <div className="image-empty">
                    <ImageOff aria-hidden="true" />
                    <span>{imageBroken ? 'That link did not load' : 'No photo yet'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-foot">
            {!isNew && (
              <button
                type="button"
                className={`btn btn-sm ${confirmDelete ? 'btn-primary' : 'btn-outline'}`}
                onClick={remove}
              >
                <Trash2 aria-hidden="true" />
                {confirmDelete ? 'Tap again to delete' : 'Delete dish'}
              </button>
            )}
            <div className="modal-foot-end">
              <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-dark btn-sm">
                {isNew ? 'Add to the menu' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
