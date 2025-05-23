'use client'

import { useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'

export type JobType = 'NAVI' | 'CVER'

interface UseColumnVisibilityProps {
  jobType: JobType
}

/**
 * Hook to manage column visibility based on job type and user role
 * Now shows all columns by default
 */
export function useColumnVisibility({ jobType }: UseColumnVisibilityProps) {
  const { user } = useAuth()
  const isCVer = jobType === 'CVER'
  const isLeaderOrMaintainer =
    user?.role === 'LEADER' || user?.role === 'MAINTAINER'

  const columnVisibility = useMemo(() => {
    return {
      // Selection and core columns - always visible
      select: true,
      job_name: true,
      job_status: true,
      username: true,
      status: true,
      modified: true,

      // Show all basic columns by default
      external_linked: true,
      setting_id: true,
      media: true,
      media_off: true,
      scheduler_weekday: true,
      scheduler_time: true,
      time: true,
      cube_off: true,
      conmane_off: true,
      redownload_type: true,
      redownload: true,
      which_process: true,
      drive_folder: true,
      old_drive_folder: true,
      master_account: true,
      workplace: true,
      chanel_id: true,
      slack_id: true,

      // Navigator specific columns - show only for NAVI
      cad_inform: !isCVer,
      cad_id: !isCVer,
      wait_time: !isCVer,
      spreadsheet_id: !isCVer,
      spreadsheet_sheet: !isCVer,
      custom_info: !isCVer,
      use_api: !isCVer,
      conmane_confirm: !isCVer,
      group_by: !isCVer,

      // CVer specific columns - show only for CVER
      upload: isCVer,
      upload_opemane: isCVer,
      opemane: isCVer,
      split_medias: isCVer,
      split_days: isCVer,
      media_master_update: isCVer,
      media_master_update_off: isCVer,
      master_update_redownload: isCVer,
      master_update_redownload_type: isCVer,
      skip_to: isCVer,

      // Role-based visibility - show for leaders/maintainers
      is_maintaining: isLeaderOrMaintainer,
    }
  }, [isCVer, isLeaderOrMaintainer])

  return { columnVisibility, isCVer, isLeaderOrMaintainer }
}
