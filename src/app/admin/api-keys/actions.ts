'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function deleteApiKey(id: string) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/api-keys')
    return { success: true }
}

export async function createApiKey(name: string) {
    const supabase = createAdminClient()

    const newKey = `lk_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`

    const { data, error } = await supabase
        .from('api_keys')
        .insert([{ name, key: newKey, is_active: true }])
        .select()
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/api-keys')
    return { success: true, data: { ...data, key: newKey } }
}

export async function getApiKeys() {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
}
