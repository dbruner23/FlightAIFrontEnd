import React from 'react';
import DeckFlights from '../components/Maps/DeckFlights';
import GptPrompt from '../components/Input/GptPrompt';

const DeckView = () => {

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex'
        }}>
            <DeckFlights />
            <GptPrompt />
        </div>
    );
}

export default DeckView;