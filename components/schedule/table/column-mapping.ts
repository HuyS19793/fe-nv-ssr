// components/schedule/table/column-mapping.ts

/**
 * Mapping from column keys to display names
 * Used for column headers and translation keys
 */
export const columnMapping: Record<string, string> = {
  username: 'Assign',
  external_linked: 'External Cver',
  setting_id: 'Setting ID',
  status: 'Scheduler Status',
  job_name: 'Project',
  job_status: 'Result',
  modified: 'Latest Update',
  is_maintaining: 'Maintaining Request',
  media: 'Media',
  media_master_update: 'Media Master Update',
  scheduler_weekday: 'Schedule Week Day',
  scheduler_time: 'Schedule Time',
  time: 'Time',
  cube_off: 'Cube Off',
  conmane_off: 'Conmane Off',
  redownload_type: 'Redownload Type',
  redownload: 'Redownload',
  master_update_redownload_type: 'Master Update Redownload Type',
  master_update_redownload: 'Master Update Redownload',
  upload: 'Upload',
  upload_opemane: 'Upload Opemane',
  opemane: 'Opemane',
  split_medias: 'Split Medias',
  split_days: 'Split Days',
  which_process: 'Which Process',
  cad_inform: 'Cad Inform',
  conmane_confirm: 'Conmane Confirm',
  group_by: 'Group By',
  cad_id: 'Cad ID',
  wait_time: 'Wait Time Rate',
  spreadsheet_id: 'Spreadsheet ID',
  spreadsheet_sheet: 'Spreadsheet Sheet',
  drive_folder: 'Drive Folder',
  old_drive_folder: 'Old Drive Folder',
  custom_info: 'Custom Info',
  master_account: 'Master Account',
  skip_to: 'Skip To',
  use_api: 'Use API',
  workplace: 'Workplace',
  chanel_id: 'Chanel ID',
  slack_id: 'Slack ID',
}

/**
 * Definition of column widths for different field types
 */
export const columnWidths: Record<
  string,
  { width: string; minWidth: string; maxWidth: string }
> = {
  username: { width: '150px', minWidth: '120px', maxWidth: '200px' },
  external_linked: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  setting_id: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  status: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  job_name: { width: '300px', minWidth: '200px', maxWidth: '400px' },
  job_status: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  modified: { width: '200px', minWidth: '180px', maxWidth: '250px' },
  is_maintaining: { width: '180px', minWidth: '150px', maxWidth: '200px' },
  media: { width: '150px', minWidth: '120px', maxWidth: '250px' },
  media_master_update: {
    width: '200px',
    minWidth: '180px',
    maxWidth: '250px',
  },
  scheduler_weekday: {
    width: '180px',
    minWidth: '150px',
    maxWidth: '200px',
  },
  scheduler_time: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  time: { width: '120px', minWidth: '100px', maxWidth: '150px' },
  cube_off: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  conmane_off: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  redownload_type: { width: '200px', minWidth: '180px', maxWidth: '250px' },
  redownload: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  master_update_redownload_type: {
    width: '250px',
    minWidth: '200px',
    maxWidth: '300px',
  },
  master_update_redownload: {
    width: '200px',
    minWidth: '180px',
    maxWidth: '250px',
  },
  upload: { width: '120px', minWidth: '100px', maxWidth: '150px' },
  upload_opemane: { width: '180px', minWidth: '150px', maxWidth: '200px' },
  opemane: { width: '150px', minWidth: '120px', maxWidth: '200px' },
  split_medias: { width: '180px', minWidth: '150px', maxWidth: '250px' },
  split_days: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  which_process: { width: '180px', minWidth: '150px', maxWidth: '200px' },
  cad_inform: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  conmane_confirm: { width: '180px', minWidth: '150px', maxWidth: '200px' },
  group_by: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  cad_id: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  wait_time: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  spreadsheet_id: { width: '250px', minWidth: '200px', maxWidth: '300px' },
  spreadsheet_sheet: {
    width: '200px',
    minWidth: '180px',
    maxWidth: '250px',
  },
  drive_folder: { width: '250px', minWidth: '200px', maxWidth: '400px' },
  old_drive_folder: {
    width: '250px',
    minWidth: '200px',
    maxWidth: '400px',
  },
  custom_info: { width: '200px', minWidth: '150px', maxWidth: '300px' },
  master_account: { width: '180px', minWidth: '150px', maxWidth: '250px' },
  skip_to: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  use_api: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  workplace: { width: '150px', minWidth: '120px', maxWidth: '200px' },
  chanel_id: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  slack_id: { width: '150px', minWidth: '120px', maxWidth: '180px' },
  actions: { width: '120px', minWidth: '100px', maxWidth: '150px' },
}

/**
 * List of fields that should be excluded from the table
 */
export const excludedFields = [
  'id',
  'latest_executor_id',
  'output_path',
  'raw_data_path',
  'media_off',
  'media_master_update_off',
]
