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
import './App.css';
 

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
  const sticky = useSticky('sticky-notes');
  const Icon = sticky.editPanelOpen ? Close : Edit;

  return (
   <>
    <Box className="App" style={{cursor: sticky.cursor}}>

<Stack direction="row" sx={{p: 2, whiteSpace: 'nowrap'}}>
  <Box sx={{ flexGrow: 1 }} />
  <Collapse orientation="horizontal" in={sticky.editPanelOpen}> 
    <Button size="small" disabled={!sticky.dirty} onClick={sticky.commitNotes} sx={{mr: 1}} variant="contained">save changes <Save sx={{ ml: 1 }} /></Button>
    <Button size="small" disabled={!sticky.dirty} onClick={sticky.resetNotes} variant="outlined" sx={{mr: 1}}>undo all <Undo sx={{ ml: 1 }} /></Button> 
    <FormControlLabel control={<Switch checked={sticky.selectMode} sx={{mr: 1}} onChange={sticky.handleChange} />} label="Select Mode" />
    {sticky.selectMode && sticky.selectedNotes.length > 1 &&  <AlignButton onChange={direction => sticky.alignNotes(direction)}  />}
  </Collapse>
  <IconButton sx={{mr: 2}} onClick={() => sticky.setEditPanelOpen(!sticky.editPanelOpen)}>
    <Icon />
  </IconButton>
  <SaveButton onClick={sticky.addNote}>
    <Add />
  </SaveButton>
</Stack>

{sticky.notes.map((note, i) => <Sticky 
                                {...note} 
                                key={i} 
                                selected={sticky.selectedNotes.find(f => f === note.ID)}
                                onSelect={sticky.selectNote} 
                                onDelete={sticky.deleteNote} 
                                selectMode={sticky.selectMode} 
                                onChange={sticky.setNote} />)}

</Box>
    <Stack direction="row" sx={{color: 'white', p: 1, alignItems: 'center', justifyContent: "flex-end"}}>
      <Comment />
      <Typography variant="caption">Component StickyNotes PoC</Typography>
    </Stack>
   </>
  );
}

export default App;
