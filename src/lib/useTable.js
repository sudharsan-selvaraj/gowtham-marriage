import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { isConfigured } from './supabase'

/**
 * Tiny data helper: fetch a table, subscribe to realtime changes so everyone
 * sees updates live, and expose insert/update/remove helpers.
 *
 * @param {string} table
 * @param {{ order?: {column:string, ascending?:boolean} }} [opts]
 */
export function useTable(table, opts = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!isConfigured) {
      setLoading(false)
      return
    }
    let q = supabase.from(table).select('*')
    if (opts.order) q = q.order(opts.order.column, { ascending: opts.order.ascending ?? true })
    const { data, error } = await q
    if (error) setError(error.message)
    else setRows(data || [])
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table])

  useEffect(() => {
    load()
    if (!isConfigured) return
    // Realtime: refetch whenever anyone changes this table.
    const channel = supabase
      .channel(`realtime:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [table, load])

  const insert = async (values) => {
    const { data, error } = await supabase.from(table).insert(values).select()
    if (error) throw error
    return data
  }
  const update = async (id, values) => {
    const { error } = await supabase.from(table).update(values).eq('id', id)
    if (error) throw error
  }
  const remove = async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
  }

  return { rows, loading, error, reload: load, insert, update, remove }
}
