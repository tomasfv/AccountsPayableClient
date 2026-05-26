import toast from 'react-hot-toast'

export function confirmToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    toast.custom(
      (t) => (
        <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-2xl min-w-[300px]">
          <p className="text-sm text-slate-200 font-medium mb-4">{message}</p>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => { toast.dismiss(t.id); resolve(false) }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-card border border-surface-border hover:bg-surface-hover text-slate-300 font-medium text-sm transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { toast.dismiss(t.id); resolve(true) }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm transition-all duration-200"
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' },
    )
  })
}
