import { useEffect, useRef, type FormEvent } from 'react'
import { DomEvent } from 'leaflet'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useMapStore } from '../store'

// Rendered into Leaflet's top-right control corner via its CSS classes rather
// than as a real L.Control.
export default function SearchControl() {
  const ref = useRef<HTMLDivElement>(null)
  const userInput = useMapStore((s) => s.userInput)
  const setUserInput = useMapStore((s) => s.setUserInput)
  const search = useMapStore((s) => s.search)

  // Keep clicks and scrolls inside the form from panning or zooming the map.
  useEffect(() => {
    if (!ref.current) return
    DomEvent.disableClickPropagation(ref.current)
    DomEvent.disableScrollPropagation(ref.current)
  }, [])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void search()
  }

  return (
    <div className="leaflet-top leaflet-right">
      <div ref={ref} className="leaflet-control leaflet-bar">
        <Paper sx={{ p: 2.5, maxWidth: 400 }}>
          <Stack component="form" spacing={2} autoComplete="off" onSubmit={handleSubmit}>
            <TextField
              required
              variant="standard"
              label="Name"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <Button type="submit" variant="contained">
              Filter
            </Button>
          </Stack>
        </Paper>
      </div>
    </div>
  )
}
