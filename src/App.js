import React from 'react'; 
import useDynamoStorage from './data/DynamoStorage';
import { Sticky } from './components/Sticky';
import {
  Button,  
  Box    
} from '@mui/material';
import './App.css';


const uniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

 


function App() { 

  const store = useDynamoStorage();


  const [notes, setNotes] = React.useState([]);
  const [dirty, setDirty] = React.useState([]);
  const [cursor, setCursor] = React.useState('pointer');

  
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
  }, [store])

  React.useEffect(() => {
    !notes.length && resetNotes()
  }, [resetNotes, notes])

  const commitNotes = async () => {
    setCursor('progress');
    await store.setItem('sticky-notes', notes.map(note => ({...note, saved: new Date().toString()})));
    setDirty(false);
    setCursor('default');
  }

  const setNote = async (note) => { 
    setNotes(b => b.map(n => n.ID === note.ID ? note : n) ) 
    setDirty(true);
  }

  const alignNotes = React.useCallback(async () => { 
    const firstLeft = notes[0].left; 
    const fixed = notes.map(n => ({...n, left: firstLeft})) ;
    setNotes(fixed) 
    setDirty(true);
  }, [notes])

  const deleteNote = async (note) => {  
    const updatedNotes = notes.filter(n => n.ID !== note.ID);
    setNotes([])
    setCursor('progress');
    await store.setItem('sticky-notes', updatedNotes);
    await resetNotes()
    setCursor('default');
  }

  return (
    <Box style={{cursor, width: '100vw', height: '100vh'}}>

      <Box sx={{m: 2}}>
      <Button size="small" onClick={addNote} variant="outlined" sx={{mr: 1}}>add note</Button>
      <Button size="small" onClick={alignNotes} variant="outlined" sx={{mr: 1}}>align</Button>
      <Button size="small" disabled={!dirty} onClick={resetNotes} variant="outlined" sx={{mr: 1}}>undo</Button>
      <Button size="small" disabled={!dirty} onClick={commitNotes} sx={{mr: 1}} variant="contained">save </Button>
      
      </Box>

      {notes.map((note, i) => <Sticky onDelete={deleteNote} key={i} {...note} onChange={setNote}/>)}
 
    </Box>
  );
}

export default App;
