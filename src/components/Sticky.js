import React from 'react'; 

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


const Note = styled(Card)(({ theme, editing, severity, saved }) => ({
  position: 'absolute',
  width: 420,
  minHeight: 32,
  opacity: saved ? 1 : 0.7,
  cursor: editing ? 'default' : 'move', 
  color: theme.palette[severity].dark,
  borderLeft: 'solid 8px ' + (saved ? theme.palette[severity].main : 'gray'),   
  zIndex: editing ? 10 : 9,
  padding: theme.spacing(1),
  '&:hover': {
    outlineOffset: 1,
    outline: (saved ? 'solid' : 'dotted') + ' 2px ' + theme.palette[severity].main, 
  }
}));

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
  marginLeft: theme.spacing(1), 
  backgroundColor: theme.palette[color].main,
  outlineOffset: 1,
  outline: active ? ('solid 2px ' + theme.palette[color].main) : 'none'
}));

export const Sticky = ({ top, left, children, severity='info', onChange, onDelete, ID, ...rest }) => {
  const ref = React.useRef(null);
  const [info, setInfo] = React.useState({
    ID,
    editing: false, 
    text: children,
    color: severity
  });

  const { text, editing, color, active } = info;

  const currentObject = React.useCallback(() => ({
    ...rest,
    ID, 
    children: text,
    severity: color,
    top,
    left
  }), [ ID, color, text, rest, top, left])

  const handlePositionChange = React.useCallback((coordX, coordY) => { 
    onChange({
      ...currentObject(),
      top: coordY,
      left: coordX 
    })
  }, [ onChange, currentObject]);


  React.useEffect(() => {
    !text.length && !editing && setInfo(s => ({...s, editing: !editing}));
    !!ref.current && dragElement(ref.current, handlePositionChange, () => { 
      onDelete({ ID })
    });
  }, [ID, handlePositionChange, onDelete, editing, text]);

  const handleTextChange = (e) => {
    setInfo(s => ({...s, text: e.target.value}))
    onChange({
      ...currentObject(),
      children: e.target.value, 
    })
  }

  const handleColorChange = (hue) => {
    setInfo(s => ({...s, color: hue}))
    onChange({
      ...currentObject(),
      severity: hue
    })
  }

  const Icon = editing ? Close : Edit;
  const className = editing ? 'editing' : 'read-only'

  return <>
  <Note className={className} 
      saved={rest.saved}
      onMouseEnter={() =>  setInfo(s => ({...s, active: true}))}
      onMouseLeave={() =>  setInfo(s => ({...s, active: false}))}
      variant="outlined" 
      id="my-postit" 
      editing={editing}  
      style={{ top, left }} 
      ref={ref} 
      severity={color}>{editing 
      ? <Stack>
          <TextField value={text} fullWidth size="small" autoFocus 
            multiline rows={4} onChange={handleTextChange} label="Edit note" placeholder="Enter note text"/>
          <Stack sx={{mt: 1}} direction="row">
            <Typography variant="caption">severity: </Typography>
            {['info', 'warning', 'error', 'success']
              .map(hue => <SeverityButton onClick={() => handleColorChange(hue)} color={hue} key={hue} active={hue === color} />)}
              <Box sx={{ flexGrow: 1 }}/>
              <Typography sx={{ ml: 2 }} variant="caption">{text.length} chars. </Typography>
          </Stack>
        </Stack> 
      : <Typography sx={{lineHeight: 1}} variant="caption">{text}</Typography>}</Note>
  <EditButton active={active} onClick={() => setInfo(s => ({...s, editing: !editing}))} top={top} left={left}><Icon /></EditButton> 
 
  </>
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

