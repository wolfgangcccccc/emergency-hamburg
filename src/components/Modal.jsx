import { useState } from 'react'
import './Modal.css'
export default function Modal({ title, fields, onSave, onClose, saving }) {
  const [form, setForm] = useState(() => { const init = {}; fields.forEach(f => init[f.name] = f.default || ''); return init; })
  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const submit = (e) => { e.preventDefault(); onSave(form) }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-hd"><span>{title}</span><button className="modal-close" onClick={onClose}>✕</button></div>
        <form onSubmit={submit} className="modal-body">
          {fields.map(f => (
            <div key={f.name} className="modal-field">
              <label>{f.label}</label>
              {f.type === 'select' ? (
                <select name={f.name} value={form[f.name]} onChange={handle} required={f.required}>
                  {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input type={f.type||'text'} name={f.name} value={form[f.name]} onChange={handle} placeholder={f.placeholder||''} required={f.required} />
              )}
            </div>
          ))}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Abbrechen</button>
            <button type="submit" className="btn-save" disabled={saving}>{saving ? 'Speichern...' : 'Speichern'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
