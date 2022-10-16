import React from 'react';  
import { Sticky, useSticky } from './components/Sticky';
import {
  Button,  
  Box,
  Collapse,
  IconButton, 
  Menu,
  MenuItem,
  Stack,
  styled, 
  Typography
} from '@mui/material';

import {   
  Add, 
  Undo, 
  Save, 
  AlignHorizontalLeft, 
  AlignVerticalTop, 
  KeyboardArrowDown, 
  SelectAll,
  SpeakerNotes,
  SpeakerNotesOff } from '@mui/icons-material';
 

const AlignButton = ({ onChange }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (direction) => {
    setAnchorEl(null);
    onChange && onChange(direction)
  };
  return <>
  <Button
      size="small" 
      onClick={handleClick}
      variant="contained" 
      sx={{ mr: 1 }}
      endIcon={<KeyboardArrowDown />}
      >align</Button>

  {/* alignment menu  */}
  <Menu 
    anchorEl={anchorEl}
    open={open}
    onClose={handleClose}>
    <MenuItem onClick={() => handleClose('left')} disableRipple>
      <AlignHorizontalLeft />
      horizontal
    </MenuItem>
    <MenuItem onClick={() => handleClose('top')}  disableRipple>
      <AlignVerticalTop />
      vertical
    </MenuItem>
  </Menu>
  </>
}

const SaveButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.warning.light ,
  marginRight: theme.spacing(2),
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.warning.dark ,
  }
}))
 
const LitButton = styled(IconButton)(({ theme, active }) => ({
  outline: active ? ('solid 1px ' + theme.palette.success.light) : 'none' ,  
}))
 

function App() { 
  const [showNotes, setShowNotes] = React.useState(true); 
  const sticky = useSticky('sticky-notes'); 
  const Icon = showNotes ? SpeakerNotesOff : SpeakerNotes;
  const s = sticky.selectedNotes.length === 1 ? '' : 's'
  const handleDelete = () => {
    if (window.confirm(`Delete ${sticky.selectedNotes.length} note${s}?`)) {
      sticky.deleteNote(sticky.selectedNotes)
    }
  }

  return (
    // outer wrapper
   <Box sx={{ height: '100vh', backgroundColor: theme => theme.palette.primary.dark }}>

    {/* inner surface */}
    <Box sx={{ 
        cursor: sticky.cursor, 
        backgroundColor: 'white',
        height: 'calc(100vh - 40px)' }}>

      {/* control toolbar */}
      <Stack direction="row" sx={{p: 2, whiteSpace: 'nowrap', alignItems: 'center'}}>

        {/* spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* collapsible button list for advanced features */}
        <Collapse orientation="horizontal" in={sticky.dirty}> 

          {/* commit dirty changes to db */}
          <Button size="small" variant="contained" disabled={!sticky.dirty} onClick={sticky.commitNotes} sx={{mr: 1}}>save changes <Save sx={{ ml: 1 }} /></Button>

          {/* undo button reloads list from db */}
          <Button size="small" disabled={!sticky.dirty} onClick={sticky.resetNotes} variant="outlined" sx={{mr: 1}}>undo all <Undo sx={{ ml: 1 }} /></Button> 
 
        </Collapse>
        
        <Collapse orientation="horizontal" in={sticky.selectMode && sticky.selectedNotes.length > 0}>
          <Button onClick={handleDelete} size="small" variant="contained" sx={{mr: 1}} color="error">delete {sticky.selectedNotes.length} note{s}</Button>
          {sticky.selectedNotes.length > 1 &&  <AlignButton onChange={direction => sticky.alignNotes(direction)}  />}
        </Collapse>
 
        <Collapse orientation="horizontal" in={showNotes}>
          {/* custom button for save action  */}
          <SaveButton onClick={sticky.addNote}>
            <Add />
          </SaveButton>

          <LitButton active={sticky.selectMode} sx={{mr: 2}} onClick={() => sticky.handleChange({target: {checked: !sticky.selectMode}})}>
            <SelectAll />
          </LitButton> 

        </Collapse>

        <LitButton active={showNotes} sx={{mr: 2}} onClick={() => setShowNotes(!showNotes)}>
          <Icon />
        </LitButton> 

      </Stack>

      {/* render note list  */}
      {showNotes && sticky.notes.map((note, i) => (
        <Sticky 
          key={i} 
          {...note}  
          {...sticky.stickyProps(note)} 
        />))}
    </Box>

    {/* footer  */}
    <Stack direction="row" sx={{color: 'white', p: 1, alignItems: 'center', justifyContent: "flex-end"}}>
      <SpeakerNotes sx={{mr: 1}} />
      <Typography variant="caption">
        <b>Component StickyNotes PoC</b>.{" "}
        Check out <a target="_blank" rel="noreferrer" style={{color: "yellow"}} href="https://github.com/miltonejones/sticky-note-react">the repo</a>.
      </Typography>
    </Stack>
   </Box>
  );
}

export default App;
