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
    const baseColumns = {
      // Core pinned columns - always visible
      select: true,
      actions: true,
      job_name: true,
      job_status: true,

      // Common columns
      username: true, // Task assign
      setting_id: true,
      status: true,
      modified: true,
      is_maintaining: isLeaderOrMaintainer,

      // Scheduling columns
      scheduler_weekday: true,
      scheduler_time: true,
      time: true,

      // Media & Process - common
      media: true,
      redownload_type: true,
      redownload: true,
      which_process: true,

      // Shared process columns
      cube_off: true,
      conmane_off: true,
    }

    if (isCVer) {
      // CVer tab - show CVer specific columns
      return {
        ...baseColumns,

        // CVer specific columns
        upload: true,
        upload_opemane: true,
        opemane: true,
        media_master_update: true,
        master_update_redownload_type: true,
        master_update_redownload: true,
        split_medias: true,
        split_days: true,
        skip_to: true,

        // Common fields for CVer
        drive_folder: true,
        old_drive_folder: true,
        master_account: true,
        workplace: true,
        chanel_id: true,
        slack_id: true,

        // Hide Navigator specific columns
        external_linked: false,
        cad_inform: false,
        conmane_confirm: false,
        group_by: false,
        cad_id: false,
        wait_time: false,
        spreadsheet_id: false,
        spreadsheet_sheet: false,
        custom_info: false,
        use_api: false,
      }
    }

    // Navigator tab - show Navigator specific columns
    return {
      ...baseColumns,

      // Navigator specific columns
      external_linked: true,
      cad_inform: true,
      conmane_confirm: true,
      group_by: true,
      cad_id: true,
      wait_time: true,
      spreadsheet_id: true,
      spreadsheet_sheet: true,
      drive_folder: true,
      old_drive_folder: true,
      custom_info: true,
      master_account: true,
      use_api: true,
      workplace: true,
      chanel_id: true,
      slack_id: true,

      // Hide CVer specific columns
      upload: false,
      upload_opemane: false,
      opemane: false,
      media_master_update: false,
      master_update_redownload_type: false,
      master_update_redownload: false,
      split_medias: false,
      split_days: false,
      skip_to: false,
    }
  }, [isCVer, isLeaderOrMaintainer])

  return { columnVisibility, isCVer, isLeaderOrMaintainer }
}
