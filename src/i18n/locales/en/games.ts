import type { Translation } from '../../types';
import type fr from '../fr/games';

const games: Translation<typeof fr> = {
  status: {
    lobby: 'Waiting',
    drawn: 'Names drawn',
    revealed: 'Revealed',
  },
  dashboard: {
    hello: 'Hi, {{name}}',
    subtitle: 'your games',
    join: 'Join a game',
    create: 'Start a game',
    unknownError: 'Something went wrong.',
    emptyTitle: 'No games yet',
    emptyBody: 'Start your first game or join a friend’s.',
    code: 'Code:',
    weeks_one: '{{count}} week',
    weeks_other: '{{count}} weeks',
    leave: 'Leave',
    leaveConfirm: 'Leave this game?',
    left: 'You’ve left the game.',
    leaveError: 'We couldn’t remove you from the game. Please try again.',
  },
  create: {
    title: 'Start a game',
    subtitle: 'set up your gift exchange',
    name: 'Game name',
    namePlaceholder: 'e.g. Office Holiday Party 2026',
    weeks: 'Length (weeks)',
    reminder: 'Reminder (days before)',
    hint: 'You’ll be playing too, and you’ll be the organizer. Others can join with the code.',
    back: 'Back',
    submit: 'Create the game',
    nameRequired: 'Give your game a name.',
    noName: 'We couldn’t get your name.',
    created: 'Your game is ready!',
    error: 'We couldn’t create the game. Please try again.',
  },
  join: {
    title: 'Join a game',
    subtitle: 'enter the code you got',
    compass: 'Compass',
    code: 'Game code',
    back: 'Back',
    submit: 'Join',
    noCode: 'No code?',
    createInstead: 'Start your own game',
    tooShort: 'The code must be at least 4 characters.',
    joined: 'You’re in!',
    alreadyIn: 'You’re already in this game.',
    notFound: 'Invalid code, or the game doesn’t exist.',
    error: 'We couldn’t join the game. Please try again.',
  },
};

export default games;
