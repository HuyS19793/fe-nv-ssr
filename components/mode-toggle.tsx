'use client'

import * as React from 'react'

import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant='outline'
      size='icon'
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label='Toggle theme'>
      {theme === 'light' ? (
        <Moon className='size-4' />
      ) : (
        <Sun className='size-4' />
      )}
    </Button>
  )
}
