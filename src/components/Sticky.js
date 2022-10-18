import React from 'react'; 
import useDynamoStorage from '../data/DynamoStorage';
import { 
  Alert,
  Avatar,
  Box,  
  Button,
  Collapse,
  Divider,
  IconButton,
  Stack,
  styled,
  TextField,
  Typography,
} from '@mui/material';

import { Edit, Close } from '@mui/icons-material';

const uniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const Note = styled(Alert)(({ theme, editing, severity, selected, selectMode, viewports = [] }) => {
  const style = {
    borderRadius: 0,
    position: 'absolute',
    backgroundColor: 'white',
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
      zIndex: 12,
    },
    '& .MuiAlert-message': {
      width: '100%'
    }
  };
  if (selectMode) {
    Object.assign(style, {
      color: 'gray',
      borderLeft: 'solid 8px gray',
      outlineOffset: 1,
      outline: (selected ? 'solid' : 'dotted') + ' 2px gray',
      '&:hover': {}
    })
  }

  if (editing || !viewports.length || viewports.length === 2) {
    return style;
  }

  const size = viewports[0];
  Object.assign (style, {
    [theme.breakpoints.up('sm')]: {
      display: size === 'sm' ? 'none' : 'flex'
    },
    [theme.breakpoints.down('sm')]: {
      display: size === 'sm' ? 'flex' : 'none'
    },
  })

  return style;  
}); 

const ColorButton = styled(Box)(({ theme, color, active }) => ({
  width: 20,
  height: 20,
  borderRadius: 4,
  cursor: 'pointer',
  marginLeft: theme.spacing(1), 
  backgroundColor: theme.palette[color].main,
  outlineOffset: 1,
  outline: active ? ('solid 2px ' + theme.palette[color].main) : 'none'
}));

const ViewPortButton = styled(Avatar)(({ theme, color, active }) => ({
  width: 20,
  height: 20,
  borderRadius: 2,
  fontSize: '0.7rem',
  fontWeight: active ? 600 : 400,
  textTransform: 'uppercase',
  backgroundColor: 'white',
  marginLeft: theme.spacing(1),
  padding: theme.spacing(0),
  outlineOffset: 1,
  color: active ? theme.palette[color].main : 'gray',
  outline: active ? ('solid 1px ' + theme.palette[color].main) : 'none',
  lineHeight: 1,
  display:'flex',
  alignItems: 'center'
}));

const TextBox = styled(TextField)(() => ({
  '& .MuiInputBase-input': {
    fontSize: '0.8rem',
    lineHeight: 1.4
  }
}))

const NoteContent = ({ 
  editing, 
  children, 
  severity, 
  viewports ,
  handleTextChange, 
  handleColorChange ,
  handleViewPortChange
}) => {

  // show note edit form when editing
  if (editing) {
    return (
      <Stack>
      {/* note entry field  */}
        <TextBox value={children} size="small" fullWidth autoFocus  color={severity}
          multiline rows={4} onChange={handleTextChange} label="Edit note" 
          placeholder="Enter note text" />

        {/* note footer  */}
        <Stack sx={{mt: 1}} direction="row">
          <Typography variant="caption">color: </Typography>

          {['info', 'warning', 'error', 'success']
            .map(hue => <ColorButton color={hue} key={hue} active={hue === severity} onClick={() => handleColorChange(hue)} />)}

          <Box sx={{ flexGrow: 1 }}/> 

          <Typography variant="caption">breakpoints: </Typography>
          {['sm','lg'].map(size => <ViewPortButton 
          active={!viewports?.length || viewports.find(q => q === size)} 
          key={size} 
          variant="button" 
          color={severity}
          onClick={() => handleViewPortChange(size)
          }>{size}</ViewPortButton>)}

          <Typography sx={{ ml: 2 }} variant="caption">{children.length} chars. </Typography>
        </Stack>
      </Stack> 
    )
  }

  // note content 
  return <Typography sx={{lineHeight: 1}} variant="caption">{children}</Typography> 
}


export const Sticky = ({ 

    // note props
    ID,
    top, 
    left, 
    children, 
    severity='info', 
    viewports=[],
    
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

  const getCurrentObject = React.useCallback(() => ({
    ...rest,
    ID, 
    children,
    severity,
    top,
    left
  }), [ID, children, severity, rest, top, left]);


  const handlePositionChange = React.useCallback((coordX, coordY) => { 
    onChange({
      ...getCurrentObject(),
      top: coordY,
      left: coordX 
    })
  }, [ onChange, getCurrentObject ]);

  const handleDelete = React.useCallback(() => {
    if (window.confirm(`Delete note "${children}"?`)) {
      onDelete([ ID ]);
      return true;
    }
    return false;
  }, [onDelete, ID, children]);

  const handleKeyUp = React.useCallback((keyCode, x,  y) => { 
    const offset = 4;
    if (selectMode) {
      switch (keyCode) {
        case 37:
          handlePositionChange(x - offset, y);
          break;
        case 38:
          handlePositionChange(x, y - offset);
          break;
        case 39:
          handlePositionChange(x + offset, y);
          break;
        case 40:
          handlePositionChange(x, y + offset);
          break;
        default:
          // do nothing
      }
    }
  }, [selectMode]);

  const handleTextChange = (e) => { 
    onChange({
      ...getCurrentObject(),
      children: e.target.value.substr(0, 300), 
    })
  }

  const handleColorChange = (hue) => { 
    onChange({
      ...getCurrentObject(),
      severity: hue
    })
  }

  const handleViewPortChange = (viewport) => {
    onChange({
      ...getCurrentObject(),
      viewports: viewports.find(view => view  === viewport)
        ? viewports.filter(view => view !== viewport)
        : viewports.concat(viewport)
    })
  }


  React.useEffect(() => { 
    !!ref.current && attachDragEvent(ref.current, handlePositionChange, handleDelete, handleKeyUp);
  }, [ handlePositionChange, handleDelete]);

  const Icon = editing ? Close : Edit;
  const className = editing || selectMode ? 'editing' : 'read-only';

  const noteProps = {
    variant: 'outlined',
    id: `postit-${ID}`,
    className,
    selectMode,
    selected,
    editing,
    severity,
    viewports,
    style: { top, left },
    onClick: () => selectMode && !!onSelect && onSelect(ID),
    onMouseEnter: () => !selectMode && setInfo(state => ({...state, active: true})),
    onMouseLeave: () => !selectMode && setInfo(state => ({...state, active: false}))
  };

  const contentProps = {
    editing,
    severity, 
    viewports,
    handleTextChange, 
    handleColorChange ,
    handleViewPortChange
  };

  const buttonProps = {
    endIcon: <Icon />,
    size: 'small', 
    variant: 'contained',
    color: editing ? 'error' : 'primary',   
    onClick: () => setInfo(state => ({...state, editing: !editing }))
  };

  return <>
    <Note {...noteProps} ref={ref} > 
      <NoteContent {...contentProps}>{children}</NoteContent>
      <Collapse sx={{textAlign: 'right'}} in={active || editing}>
        <Divider sx={{mt: 1, mb: 1}} />
        <Button {...buttonProps}>{editing ? "close" : "edit"}   </Button>
      </Collapse>
    </Note>
    
  </>
}



export const useSticky = (dynamoStorageKey) => {

  const store = useDynamoStorage();

 

  const [selectedNotes, setSelectedNotes] = React.useState([]);
  const [notes, setNotes] = React.useState([]);
  const [dirty, setDirty] = React.useState([]);
  const [selectMode, setSelectMode] = React.useState(false);
  const [cursor, setCursor] = React.useState('pointer');

  const handleChange = (event) => {
    setSelectMode(event.target.checked);
    setSelectedNotes([]);
  };

  const selectNote = React.useCallback(id => {
    setSelectedNotes(items => items.find(item => item === id) 
      ? items.filter(item => item !== id)
      : items.concat(id))
  }, []);

  const addNote = React.useCallback(async () => {
    setNotes(noteList => noteList.concat({
      ID: uniqueId(),
      children: 'New Note',
      severity: 'info',
      top: 200,
      left: 400
    }));
    setDirty(true);
  }, []);

  const resetNotes = React.useCallback(async () => {
    setCursor('progress');
    const noteResponse = await store.getItem(dynamoStorageKey);
    setNotes(noteResponse);
    setDirty(false);
    setCursor('default');
  }, [store, dynamoStorageKey]);

  const commitNotes = React.useCallback(async () => {
    setCursor('progress');
    await store.setItem(dynamoStorageKey, notes);
    setDirty(false);
    setCursor('default');
  }, [store, notes, dynamoStorageKey]);

  const setNote = React.useCallback(async (note) => { 
    setNotes(noteList => noteList.map(noteItem => noteItem.ID === note.ID ? note : noteItem) ) 
    setDirty(true); 
  }, []);

  const alignNotes = React.useCallback(async (direction) => {  
    const filterNotes = noteItem => selectedNotes.find(noteId => noteId === noteItem.ID); 
    const primaryNote = notes.find(noteItem => noteItem.ID === selectedNotes[0]); 
    const alignedList = notes.map(noteItem => ({
      ...noteItem, 
      [direction]: filterNotes(noteItem) ? primaryNote[direction] : noteItem[direction]
    })) ;
    setNotes(alignedList) 
    setDirty(true);
    setSelectedNotes([]);
    setSelectMode(false);
  }, [notes, selectedNotes]);

  const deleteNote = React.useCallback(async (noteIds) => {  
    const filteredNotes = notes.filter(noteItem => !noteIds.find(noteId => noteItem.ID === noteId)); 
    setNotes(filteredNotes);
    setSelectedNotes([]);
    setSelectMode(false);
    setDirty(true); 
  }, [ notes ]);
 
  const stickyProps = (note) => ({
    selected: selectedNotes.find(f => f === note.ID),
    onSelect: selectNote,
    onDelete: deleteNote,
    onChange: setNote,
    selectMode,
  })

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
    handleChange,
    notes,
    resetNotes,
    selectMode,
    selectNote,
    selectedNotes, 
    setNote,
    stickyProps
  };

};


/**
 * adds drag event to an HTML element
 * @param {HTMLElement} elmnt - element to drag 
 */
function attachDragEvent(elmnt, setInfo, onDelete, onKeyUp) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, lastX = 0, lastY = 0;
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
    lastX = elmnt.offsetLeft;
    lastY = elmnt.offsetTop;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
    document.onkeyup = keyUp;
    
  }

  function keyUp(e) { 
    console.log ({ e })
    onKeyUp && onKeyUp(e.keyCode || e.which, elmnt.offsetLeft, elmnt.offsetTop);
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
      if (!onDelete()) {
        // if delete action is cancelled, return note to start position
        elmnt.style.top = lastY + "px";
        elmnt.style.left = lastX + "px";
      }
    }
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

