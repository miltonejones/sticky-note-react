import React from 'react'; 
import useDynamoStorage from '../data/DynamoStorage';
import { 
  IconButton,
  Stack,
  TextField,
  Box, 
  Card,
  Typography,
  styled,
} from '@mui/material';

import { Edit, Close } from '@mui/icons-material';

const uniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);


const Note = styled(Card)(({ theme, editing, severity, selected, selectMode }) => {
  const style = {
    position: 'absolute',
    width: 420,
    minHeight: 32, 
    cursor: editing ? 'default' : 'move', 
    color: theme.palette[severity].dark,
    borderLeft: 'solid 8px ' + theme.palette[severity].main,
    zIndex: editing ? 10 : 9,
    padding: theme.spacing(1),
    '&:hover': {
      outlineOffset: 1,
      outline:  'solid 2px ' + theme.palette[severity].main, 
    }
  };
  if (selectMode) {
    Object.assign(style, {
      color: 'gray',
      borderLeft: 'solid 8px gray',
      outline: (selected ? 'solid' : 'dotted') + ' 2px gray',
      '&:hover': {}
    })
  }
  return style;
});


const EditButton = styled(IconButton)(({ theme, left, top, active}) => ({
  opacity: active ? 0.2 : 0,
  position: 'absolute',
  left: left + 392,
  top: top + 4,
  zIndex: 11,
  '&:hover': {
    opacity: 1,
  }
}));


const SeverityButton = styled(Box)(({ theme, color, active }) => ({
  width: 20,
  height: 20,
  borderRadius: 4,
  cursor: 'pointer',
  marginLeft: theme.spacing(1), 
  backgroundColor: theme.palette[color].main,
  outlineOffset: 1,
  outline: active ? ('solid 2px ' + theme.palette[color].main) : 'none'
}));


export const Sticky = ({ 

    // note props
    ID,
    top, 
    left, 
    children, 
    severity='info', 
    
    // control methods/props
    selected,
    selectMode,
    onSelect,
    onChange, 
    onDelete,  
    
    // added for future props
    ...rest 
  }) => {
  const ref = React.useRef(null);
  const [info, setInfo] = React.useState({
    ID,
    editing: false ,
    active: false
  });

  const { editing, active } = info;

  const currentObject = React.useCallback(() => ({
    ...rest,
    ID, 
    children,
    severity,
    top,
    left
  }), [ ID, children, severity, rest, top, left])


  const handlePositionChange = React.useCallback((coordX, coordY) => { 
    onChange({
      ...currentObject(),
      top: coordY,
      left: coordX 
    })
  }, [ onChange, currentObject]);

  const handleTextChange = (e) => { 
    onChange({
      ...currentObject(),
      children: e.target.value, 
    })
  }

  const handleColorChange = (hue) => { 
    onChange({
      ...currentObject(),
      severity: hue
    })
  }


  React.useEffect(() => { 
    !!ref.current && dragElement(ref.current, handlePositionChange, () => { 
      onDelete({ ID })
    });
  }, [ID, handlePositionChange, onDelete]);

  const Icon = editing ? Close : Edit;
  const className = editing || selectMode ? 'editing' : 'read-only'

  return <>
    <Note className={className}  
      onMouseEnter={() =>  setInfo(s => ({...s, active: true}))}
      onMouseLeave={() =>  setInfo(s => ({...s, active: false}))}
      onClick={() => selectMode && !!onSelect && onSelect(ID)}
      variant="outlined" 
      id="my-postit" 
      selectMode={selectMode}
      selected={selected}
      editing={editing}  
      style={{ top, left }} 
      ref={ref} 
      severity={severity}>{editing 
      ? <Stack>
          <TextField value={children} fullWidth size="small" autoFocus 
            multiline rows={4} onChange={handleTextChange} label="Edit note" placeholder="Enter note text"/>
          <Stack sx={{mt: 1}} direction="row">
            <Typography variant="caption">severity: </Typography>
            {['info', 'warning', 'error', 'success']
              .map(hue => <SeverityButton onClick={() => handleColorChange(hue)} color={hue} key={hue} active={hue === severity} />)}
              <Box sx={{ flexGrow: 1 }}/>
              <Typography sx={{ ml: 2 }} variant="caption">{children.length} chars. </Typography>
          </Stack>
        </Stack> 
      : <Typography sx={{lineHeight: 1}} variant="caption">{children}</Typography>}
    </Note>
    {!selectMode && <EditButton active={active} onClick={() => setInfo(s => ({...s, editing: !editing}))} top={top} left={left}><Icon /></EditButton>} 
 
  </>
}



export const useSticky = () => {

  const store = useDynamoStorage();


  const [editPanelOpen, setEditPanelOpen] = React.useState(false);
  const [notes, setNotes] = React.useState([]);
  const [dirty, setDirty] = React.useState([]);
  const [selectedNotes, setSelectedNotes] = React.useState([]);
  const [selectMode, setSelectMode] = React.useState(false);
  const [cursor, setCursor] = React.useState('pointer');

  const handleChange = (event) => {
    setSelectMode(event.target.checked);
    setSelectedNotes([])
  };

  const selectNote = React.useCallback(id => {
    setSelectedNotes( items => items.find(i => i === id) 
      ? items.filter(i => i !== id)
      : items.concat(id))
  }, [])

  const addNote = React.useCallback(async () => {
    setNotes(f => f.concat({
      ID: uniqueId(),
      children: 'New Note',
      severity: 'info',
      top: 200,
      left: 400
    }));
  }, []);

  const resetNotes = React.useCallback(async () => {
    setCursor('progress');
    const dbNotes = await store.getItem('sticky-notes');
    setNotes(dbNotes);
    setDirty(false);
    setCursor('default');
  }, [store]);

  const commitNotes = React.useCallback(async () => {
    setCursor('progress');
    await store.setItem('sticky-notes', notes.map(note => ({...note, saved: new Date().toString()})));
    setDirty(false);
    setCursor('default');
  }, [store, notes])

  const setNote = React.useCallback(async (note) => { 
    setNotes(b => b.map(n => n.ID === note.ID ? note : n) ) 
    setDirty(true);
    setEditPanelOpen(true);
  }, []);

  const alignNotes = React.useCallback(async () => { 
    const filterNotes = noteItem => selectedNotes.find(noteId => noteId === noteItem.ID);
    const chosenNotes = notes.filter(filterNotes);
    const firstLeft = chosenNotes[0].left; 
    const fixed = notes.map(noteItem => ({...noteItem, left: filterNotes(noteItem) ? firstLeft : noteItem.left})) ;
    setNotes(fixed) 
    setDirty(true);
    setSelectedNotes([]);
    setSelectMode(false)
  }, [notes, selectedNotes]);

  const deleteNote = React.useCallback(async (note) => {  
    const updatedNotes = notes.filter(n => n.ID !== note.ID);
    setNotes([])
    setCursor('progress');
    await store.setItem('sticky-notes', updatedNotes);
    await resetNotes()
    setCursor('default');
    setEditPanelOpen(true);
  }, [notes, store, resetNotes]);

  React.useEffect(() => {
    !notes.length && resetNotes();
  }, [resetNotes, notes]);

  return {
    addNote,
    alignNotes,
    commitNotes,
    cursor,
    deleteNote,
    dirty,
    editPanelOpen,
    handleChange,
    notes,
    resetNotes,
    selectMode,
    selectNote,
    selectedNotes,
    setEditPanelOpen,
    setNote
  }

}





/**
 * adds drag event to an HTML element
 * @param {HTMLElement} elmnt - element to drag 
 */
function dragElement(elmnt, setInfo, onDelete) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (elmnt.classList.contains('editing')) {
      return;
    }
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
  
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    const x = elmnt.offsetLeft - pos1;
    const y = elmnt.offsetTop - pos2;
    setInfo(x, y);
    elmnt.style.top = y + "px";
    elmnt.style.left = x + "px";
  }

  function closeDragElement() { 
    // stop moving when mouse button is released:
    if (elmnt.offsetLeft < 0 && !!onDelete) {
      if (window.confirm('Delete note?')) onDelete()
      else  elmnt.style.left = "50px";
    }
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

