import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useTable } from '../lib/useTable'
import { useAuth } from '../contexts/AuthContext'
import { uploadToR2 } from '../lib/upload'
import { PageHeader, EmptyState, Loading, SetupNotice } from '../components/ui'
import { SignInPrompt } from './Timeline'

const ALBUMS = ['All', 'Shopping', 'Venue', 'Cards', 'Outfits', 'Food tasting', 'Misc']

export default function Gallery() {
  const { isEditor, displayName, user } = useAuth()
  const { requireLogin } = useOutletContext()
  const { rows, loading, insert, remove } = useTable('photos', {
    order: { column: 'created_at', ascending: false },
  })
  const [album, setAlbum] = useState('All')
  const [uploadAlbum, setUploadAlbum] = useState('Shopping')
  const [caption, setCaption] = useState('')
  const [progress, setProgress] = useState(null)
  const [err, setErr] = useState('')
  const [lightbox, setLightbox] = useState(null)

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setErr('')
    try {
      for (const file of files) {
        setProgress(0)
        const { publicUrl } = await uploadToR2(file, uploadAlbum.toLowerCase(), setProgress)
        await insert({
          url: publicUrl,
          album: uploadAlbum,
          caption: caption || null,
          uploaded_by: displayName,
          uploader_id: user.id,
        })
      }
      setCaption('')
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setProgress(null)
      e.target.value = ''
    }
  }

  const shown = album === 'All' ? rows : rows.filter((p) => p.album === album)

  return (
    <div className="animate-fade-up">
      <PageHeader title="Gallery" subtitle="Shopping trips, tastings and shared moments." />
      <div className="space-y-6">
        <SetupNotice />

        {isEditor ? (
          <div className="card space-y-4">
            <div className="flex gap-2 flex-wrap">
              {ALBUMS.filter((a) => a !== 'All').map((a) => (
                <button key={a} onClick={() => setUploadAlbum(a)}
                  className={`chip border ${uploadAlbum === a ? 'bg-accent text-white border-accent' : 'bg-white text-muted border-line'}`}>
                  {a}
                </button>
              ))}
            </div>
            <input className="input" placeholder="Caption (optional)"
              value={caption} onChange={(e) => setCaption(e.target.value)} />
            <label className="btn-primary w-full cursor-pointer">
              {progress !== null ? `Uploading… ${progress}%` : `Upload to “${uploadAlbum}”`}
              <input type="file" accept="image/*" multiple hidden onChange={onFiles} disabled={progress !== null} />
            </label>
            {err && <p className="text-accent text-sm">{err}</p>}
          </div>
        ) : (
          <SignInPrompt onClick={requireLogin} />
        )}

        <div className="flex gap-2 flex-wrap">
          {ALBUMS.map((a) => (
            <button key={a} onClick={() => setAlbum(a)}
              className={`chip border transition-colors ${album === a ? 'bg-ink text-white border-ink' : 'bg-white text-muted border-line hover:text-ink'}`}>
              {a}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : shown.length === 0 ? (
          <EmptyState title="No photos yet" hint="Share the first snap from a shopping trip." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {shown.map((p) => (
              <figure key={p.id}
                onClick={() => setLightbox(p)}
                className="group relative overflow-hidden rounded-xl border border-line bg-white cursor-pointer animate-fade-up">
                <img src={p.url} alt={p.caption || 'photo'} loading="lazy"
                  className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105" />
                {p.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 text-sm text-white">
                    {p.caption}
                  </figcaption>
                )}
                {isEditor && p.uploader_id === user?.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(p.id) }}
                    className="absolute top-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-xs text-ink opacity-0 group-hover:opacity-100 transition hover:text-accent">
                    Remove
                  </button>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <div className="max-w-3xl w-full text-center" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption || ''} className="max-h-[75vh] mx-auto rounded-xl" />
            {lightbox.caption && <p className="text-white mt-3">{lightbox.caption}</p>}
            <p className="text-white/60 text-sm mt-1">Shared by {lightbox.uploaded_by}</p>
            <button onClick={() => setLightbox(null)} className="btn-ghost bg-white/10 text-white border-white/20 mt-4">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
