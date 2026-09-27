import { useEffect, useState } from 'react';
import { useSession } from '../context/session';
import { supabase } from '../lib/supabase';
import { lives as demoLives, type Live } from './mock';

const palette = ['#2B2B2B', '#4A4A4A', '#1A1A1A', '#5C5C5C', '#333333', '#3D3D3D'];

type LiveRow = {
  id: string;
  title: string;
  category_id: string;
  is_premium: boolean;
  viewer_count: number;
  thumbnail_url: string | null;
  host: { username: string | null; display_name: string | null; avatar_url: string | null } | null;
};

// Lives en cours depuis Supabase ; tant qu'il n'y en a aucun, on montre les lives de démo.
export function useLives() {
  const { myLive } = useSession();
  const [lives, setLives] = useState<Live[]>(demoLives);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from('lives')
      .select(
        'id, title, category_id, is_premium, viewer_count, thumbnail_url, host:profiles!lives_host_id_fkey(username, display_name, avatar_url)',
      )
      .eq('status', 'live')
      .order('viewer_count', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled || error || !data?.length) return;
        setLives(
          (data as unknown as LiveRow[]).map((row, i) => ({
            id: row.id,
            title: row.title,
            host: row.host?.display_name ?? row.host?.username ?? 'Créateur',
            handle: `@${row.host?.username ?? 'senlive'}`,
            category: row.category_id,
            viewers: row.viewer_count,
            premium: row.is_premium,
            color: palette[i % palette.length],
            thumbnail: row.thumbnail_url ?? undefined,
            avatar: row.host?.avatar_url ?? undefined,
          })),
        );
        setIsDemo(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Le live lancé depuis l'onglet Go Live apparaît en tête de liste.
  return { lives: myLive ? [myLive, ...lives] : lives, isDemo };
}
