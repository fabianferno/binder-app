import React, {useState, useMemo} from 'react';
import TinderCard from 'react-tinder-card';
import {View, ImageBackground, Text, TouchableOpacity} from 'react-native';
import {profiles} from '../constants/Placeholders';
import tw from 'twrnc';

const styles: any = {
  container: {
    marginTop: 50,
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  header: {
    color: '#000',
    fontSize: 30,
    marginBottom: 30,
  },
  cardContainer: {
    width: '90%',
    maxWidth: 260,
    height: 300,
  },
  card: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 260,
    height: 400,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 20,
  },
  cardTitle: {
    position: 'absolute',
    bottom: 0,
    margin: 10,
    color: '#fff',
  },

  infoText: {
    height: 28,
    justifyContent: 'center',
    display: 'flex',
    zIndex: -100,
  },
};

let alreadyRemoved: any = [];
let charactersState = profiles; // This fixes issues with updating characters state forcing it to use the current state and not the state that was active when the card was created.

function Match() {
  const [characters, setCharacters] = useState(profiles);
  const [lastDirection, setLastDirection] = useState();

  const childRefs: any = useMemo(
    () =>
      Array(profiles.length)
        .fill(0)
        .map(() => React.createRef()),
    [],
  );

  const swiped = (direction: any, nameToDelete: string) => {
    console.log('removing: ' + nameToDelete + ' to the ' + direction);

    // Do something with the card swiped
    if (direction === 'right') {
      // TODO: 1. Generate sismo zkProof
      // TODO: 2. Send sismo zkProof and signature to notification
    }

    setLastDirection(direction);
    alreadyRemoved.push(nameToDelete);
  };

  const outOfFrame = (name: string) => {
    console.log(name + ' left the screen!');
    charactersState = charactersState.filter(
      character => character.name !== name,
    );
    setCharacters(charactersState);
  };

  const swipe = (dir: any) => {
    const cardsLeft = characters.filter(
      person => !alreadyRemoved.includes(person.name),
    );
    if (cardsLeft.length) {
      const toBeRemoved = cardsLeft[cardsLeft.length - 1].name; // Find the card object to be removed
      const index = profiles.map(person => person.name).indexOf(toBeRemoved); // Find the index of which to make the reference to
      alreadyRemoved.push(toBeRemoved); // Make sure the next card gets removed next time if this card do not have time to exit the screen
      childRefs[index].current.swipe(dir); // Swipe the card!
    } else {
      // Reset the alreadyRemoved array
      setCharacters([]);
      alreadyRemoved = [];
    }
  };

  return (
    <View style={styles.container}>
      <Text style={tw`text-3xl font-bold text-red-600 mb-2 text-center`}>
        Swipe to start a relationship 😏
      </Text>
      <View style={styles.cardContainer}>
        {characters.map((character: any, index: number) => (
          <TinderCard
            preventSwipe={['up', 'down']}
            ref={childRefs[index]}
            key={character.name}
            onSwipe={dir => swiped(dir, character.name)}
            onCardLeftScreen={() => outOfFrame(character.name)}>
            <View style={styles.card}>
              <ImageBackground
                style={styles.cardImage}
                source={{uri: character.image}}>
                <Text style={styles.cardTitle}>{character.name}</Text>
              </ImageBackground>
            </View>
          </TinderCard>
        ))}
      </View>
      <View style={tw`flex-row justify-center w-full mt-5`}>
        <TouchableOpacity
          style={tw`py-3 bg-red-600 rounded-2xl mb-2 mx-2`}
          onPress={() => swipe('left')}>
          <Text
            style={tw`text-white px-5 text-right text-lg font-bold shadow-lg`}>
            ◂ Swipe left
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`py-3 bg-red-600 rounded-2xl mb-2 mx-2`}
          onPress={() => swipe('right')}>
          <Text
            style={tw`text-white px-5s text-right text-lg font-bold shadow-lg`}>
            Swipe right ▸
          </Text>
        </TouchableOpacity>
      </View>
      {lastDirection ? (
        <Text
          style={tw`text-center text-lg text-gray-500 mt-6`}
          key={lastDirection}>
          You swiped {lastDirection}
        </Text>
      ) : (
        <Text style={tw`text-center text-lg text-gray-500 mt-6`}>
          Match with NFTs to start a relationship!
        </Text>
      )}
    </View>
  );
}

export default Match;
