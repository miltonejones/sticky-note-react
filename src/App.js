import React from 'react';  
import { Sticky, useSticky } from './components/Sticky';
import {
  Button,  
  Box,
  Collapse,
  IconButton,
  FormControlLabel,
  Menu,
  MenuItem,
  Stack,
  styled,
  Switch,
  Typography
} from '@mui/material';

import { Edit, Close, Comment, Add, Undo, Save, AlignHorizontalLeft, AlignVerticalTop, KeyboardArrowDown } from '@mui/icons-material';
 

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
 

function App() { 
  const [editPanelOpen, setEditPanelOpen] = React.useState(false);
  const sticky = useSticky('sticky-notes');
  const Icon = sticky.dirty || editPanelOpen ? Close : Edit;

  return (
    // outer wrapper
   <Box sx={{ height: '100vh', backgroundColor: theme => theme.palette.primary.dark }}>

    {/* inner surface */}
    <Box sx={{ 
        cursor: sticky.cursor, 
        backgroundColor: 'white',
        height: 'calc(100vh - 40px)' }}>

      {/* control toolbar */}
      <Stack direction="row" sx={{p: 2, whiteSpace: 'nowrap'}}>

        {/* spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* collapsible button list for advanced features */}
        <Collapse orientation="horizontal" in={sticky.dirty || editPanelOpen}> 

          {/* commit dirty changes to db */}
          <Button size="small" disabled={!sticky.dirty} onClick={sticky.commitNotes} sx={{mr: 1}} variant="contained">save changes <Save sx={{ ml: 1 }} /></Button>

          {/* undo button reloads list from db */}
          <Button size="small" disabled={!sticky.dirty} onClick={sticky.resetNotes} variant="outlined" sx={{mr: 1}}>undo all <Undo sx={{ ml: 1 }} /></Button> 

          {/* note alignment controls */}
          <FormControlLabel control={<Switch checked={sticky.selectMode} sx={{mr: 1}} onChange={sticky.handleChange} />} label="Select Mode" />
          {sticky.selectMode && sticky.selectedNotes.length > 1 &&  <AlignButton onChange={direction => sticky.alignNotes(direction)}  />}
        </Collapse>

        {/* edit/close button outside the collapse  */}
        <IconButton sx={{mr: 2}} onClick={() => setEditPanelOpen(!editPanelOpen)}>
          <Icon />
        </IconButton>

        {/* custom button for save action  */}
        <SaveButton onClick={sticky.addNote}>
          <Add />
        </SaveButton>
      </Stack>

      {/* render note list  */}
      {sticky.notes.map((note, i) => (
        <Sticky 
          key={i} 
          {...note} 
          selected={sticky.selectedNotes.find(f => f === note.ID)}
          onSelect={sticky.selectNote} 
          onDelete={sticky.deleteNote} 
          selectMode={sticky.selectMode} 
          onChange={sticky.setNote} />))}
    </Box>

    {/* footer  */}
    <Stack direction="row" sx={{color: 'white', p: 1, alignItems: 'center', justifyContent: "flex-end"}}>
      <Comment />
      <Typography variant="caption">
        Component StickyNotes PoC.{" "}
        Check out <a target="_blank" rel="noreferrer" style={{color: "yellow"}} href="https://github.com/miltonejones/sticky-note-react">the repo</a>.
      </Typography>
    </Stack>
   </Box>
  );
}

export default App;
