import React from 'react';  
import { Sticky, useSticky } from './components/Sticky';
import {
  Button,  
  Box,
  Collapse,
  IconButton,
  FormControlLabel,
  Stack,
  Switch
} from '@mui/material';

import { Edit, Close, Add, Undo, Save, AlignHorizontalLeft } from '@mui/icons-material';
 

function App() { 
  const postit = useSticky();
 

  const Icon = postit.editPanelOpen ? Close : Edit;

  return (
    <Box style={{cursor: postit.cursor, width: '100vw', height: '100vh'}}>

      <Stack direction="row" sx={{m: 2, whiteSpace: 'nowrap'}}>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton sx={{mr: 2}} onClick={() => postit.setEditPanelOpen(!postit.editPanelOpen)}>
          <Icon />
        </IconButton>
        <Collapse orientation="horizontal" in={postit.editPanelOpen}>
          <Button size="small" color="warning" onClick={postit.addNote} variant="contained" sx={{mr: 1}}>new note <Add sx={{ ml: 1 }}/></Button>
          <Button size="small" disabled={!postit.dirty} onClick={postit.commitNotes} sx={{mr: 1}} variant="contained">save changes <Save sx={{ ml: 1 }} /></Button>
          <Button size="small" disabled={!postit.dirty} onClick={postit.resetNotes} variant="outlined" sx={{mr: 1}}>undo <Undo sx={{ ml: 1 }} /></Button> 
          <FormControlLabel control={<Switch checked={postit.selectMode} sx={{mr: 1}} onChange={postit.handleChange} />} label="Select Mode" />
          {postit.selectMode && postit.selectedNotes.length > 1 && (
            <Button  
              size="small" 
              onClick={postit.alignNotes} 
              variant="outlined" 
              sx={{mr: 1}}>align <AlignHorizontalLeft sx={{ ml: 1 }} /></Button>)}
        </Collapse>
      </Stack>

      {postit.notes.map((note, i) => <Sticky 
                                      {...note} 
                                      key={i} 
                                      selected={postit.selectedNotes.find(f => f === note.ID)}
                                      onSelect={postit.selectNote} 
                                      onDelete={postit.deleteNote} 
                                      selectMode={postit.selectMode} 
                                      onChange={postit.setNote} />)}
 
    </Box>
  );
}

export default App;
