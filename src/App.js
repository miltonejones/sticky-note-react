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
  UnfoldLess,
  UnfoldMore,
  Undo, 
  Save, 
  AlignHorizontalLeft, 
  AlignVerticalTop, 
  KeyboardArrowDown, 
  Settings,
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

  const SettingsButton = ({ onChange, isFilled }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = (filled) => {
      setAnchorEl(null);
      onChange && onChange(filled)
    };
    return <>
    <IconButton
        size="small" 
        onClick={handleClick}
        variant="contained" 
        sx={{ mr: 1 }} 
        ><Settings/></IconButton>
   
    <Menu 
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}>
      <MenuItem sx={{fontWeight: isFilled ? 600 : 400}} onClick={() => handleClose(true)} disableRipple> 
        filled
      </MenuItem>
      <MenuItem sx={{fontWeight: !isFilled ? 600 : 400}} onClick={() => handleClose(false)}  disableRipple> 
        outlined
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

const Text = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    paddingLeft: 0,
    '& .MuiBox-root': {
      display: 'none'
    }
  },
}));
 

function App() { 
  const [showNotes, setShowNotes] = React.useState(true); 
  const [notesOff, setNotesOff] = React.useState(true); 
  const [filled, setFilled] = React.useState(false); 
  const sticky = useSticky('sticky-notes'); 
  const Icon = showNotes ? SpeakerNotesOff : SpeakerNotes;
  const Fold = !notesOff ? UnfoldLess : UnfoldMore;
  const s = sticky.selectedNotes.length === 1 ? '' : 's'
  const handleDelete = () => {
    if (window.confirm(`Delete ${sticky.selectedNotes.length} note${s}?`)) {
      sticky.deleteNote(sticky.selectedNotes)
    }
  }

  const coordProp = note => ({
    ...note,
    filled,
    left: showNotes ? note.left : -500,
    top: showNotes ? note.top : '50vh',
  })

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
        <Collapse orientation="horizontal" in={sticky.dirty && showNotes}> 

          {/* commit dirty changes to db */}
          <Text size="small" variant="contained" endIcon={<Save />} disabled={!sticky.dirty} onClick={sticky.commitNotes} sx={{mr: 1}}><Box>save changes</Box></Text>

          {/* undo button reloads list from db */}
          <Text size="small" disabled={!sticky.dirty} endIcon={<Undo  />} onClick={sticky.resetNotes} variant="outlined" sx={{mr: 1}}><Box>undo all</Box> </Text> 
 
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

          <LitButton active={!notesOff} sx={{mr: 2}} onClick={() => setNotesOff(!notesOff)}>
            <Fold />
          </LitButton>

          <SettingsButton isFilled={filled} onChange={setFilled} />

        </Collapse>

        <LitButton active={showNotes} sx={{ml: 2}} onClick={() => setShowNotes(!showNotes)}>
          <Icon />
        </LitButton> 

      </Stack>

      {/* render note list  */}
      {sticky.notes.map((note, i) => (
        <Sticky 
          key={i} 
          {...coordProp(note)}  
          {...sticky.stickyProps(note)} 
          collapsed={notesOff}
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
