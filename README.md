# sandstone-scoreboard

Create complex custom scoreboards with ease!

# Installing

Create a new Sandstone project:

```sh
npx sandstone-cli create <my-project>
```

Install sandstone-scoreboard using NPM:

```sh
npm install sandstone-scoreboard
```

# Usage

This documentation assumes you're familiar with the [sandstone](https://github.com/theMrZZ/sandstone) documentation. If you find an issue with this documentation, please file an [issue on Github](https://github.com/ncklwse/sandstone-scoreboard)!

Create a new Scoreboard by specifying the initial display name:

```ts
import { Scoreboard } from 'sandstone-scoreboard';

// Display names support Minecraft's JSON text formatting
const myScoreboard = new Scoreboard({
    text: 'My Custom Scoreboard!',
    color: 'gold',
    bold: true
});
```

Scoreboards aren't tied to any specific MCFunction, so you can export it and use it across multiple files.

```ts
import { Scoreboard } from 'sandstone-scoreboard';

export const myScoreboard = new Scoreboard({
    text: 'My Custom Scoreboard!',
    color: 'gold',
    bold: true
});
```
To add a line to your scoreboard, first instantiate the line class:

```ts
import { Scoreboard, Line } from 'sandstone-scoreboard';

const myScoreboard = new Scoreboard({
    text: 'My Custom Scoreboard!',
    color: 'gold',
    bold: true
});

// Adding the line to the scoreboard
myScoreboard.addLine({
    text: 'Hello world!',
    color: 'white'
});
```

![Example 1](https://raw.githubusercontent.com/ncklwse/sandstone-scoreboard/main/examples/example1.png)

Lines *must* contain at least one non-whitespace character, because of how this library was created. This library works by adding this non-whitespace character to the scoreboard as a player, with all other text being used as prefixes/suffixes on a team to which the scoreboard player is assigned.

```ts
// Adds a player called "Hello", assigned to a team with the suffix " world!"
myScoreboard.addLine({
    text: 'a',
    color: 'white'
});

// Throws error
myScoreboard.addLine({
    text: ' ',
    color: 'white'
});
```

Additionally, if you have too many similar lines of text added to the same scoreboard from which different player names can't be generated, the code won't compile because the same player can't be added to a scoreboard twice.

```ts
// Adds a player called "test"
myScoreboard.addLine({
    text: 'test',
    color: 'white'
});

// Adds a player called "tes"
myScoreboard.addLine({
    text: 'test',
    color: 'white'
});

// Adds a player called "a"
myScoreboard.addLine({
    text: 'a',
    color: 'white'
});

// Throws error
myScoreboard.addLine({
    text: 'a',
    color: 'white'
});
```

Scoreboards and lines both support arrays as of text, meaning you can combine multiple different formatting options:

```ts
import { Scoreboard, Line } from 'sandstone-scoreboard';

const myScoreboard = new Scoreboard([{
    text: 'My ',
    color: 'white',
    bold: false
}, {
    text: 'Custom ',
    color: 'gold',
    bold: true
}, {
    text: 'Scoreboard!',
    color: 'white',
    bold: false
}]);

myScoreboard.addLine([{
    text: 'Colors ',
    color: 'red'
}, {
    text: 'are ',
    color: 'gold'
}, {
    text: 'really ',
    color: 'yellow'
}, {
    text: 'fun ',
    color: 'green'
}, {
    text: 'to ',
    color: 'blue'
}, {
    text: 'use!',
    color: 'dark_purple'
}]);
```
![Example 2](https://raw.githubusercontent.com/ncklwse/sandstone-scoreboard/main/examples/example2.png)

Like scoreboards, lines aren't tied to any specific MCFunction, meaning you can export them and use them across multiple files. 

```ts
import { MCFunction } from 'sandstone';
import { myLine } from './MyOtherFile.ts';

MCFunction('test', () => {
    myLine.setText('Set text from a different function in another file!');
});
```

When adding a line, you can also specify a priority. The higher the priority, the higher the line will appear on the scoreboard. The default priority on all lines when they're added is 0.

```ts
myScoreboard.addLine({
    text: 'Added first'
});

myScoreboard.addLine({
    text: 'Added second'
});

myScoreboard.addLine({
    text: 'Added third, but with priority'
}, 2);
```
![Example 3](https://raw.githubusercontent.com/ncklwse/sandstone-scoreboard/main/examples/example3.png)

To edit a line on a scoreboard, use the `.setText()` method on the line:

```ts
myLine.setText({
    text: 'Wooo!',
    color: 'green'
});
```

To show or hide your scoreboard, it's as simple as using:

```ts
// Show the scoreboard
myScoreboard.show();

// Hide the scoreboard
myScoreboard.hide();
```

You can also show/hide your scoreboard to a specific display slot:

```ts
// Show your scoreboard to teams with a color of red:
myScoreboard.show('sidebar.team.red');
```

One of the features which I'm most proud of is the ability to animate scoreboard objectives, which can be done using the `.animate()` method. The sole argument is an array of objects with the `display` property containing a JSON Text Component, as well as an optional `duration` property. The duration of each frame is specified in ticks, with the default being 20.

```ts
myScoreboard.animate([{
    display: {
        text: 'Hello world!',
        color: 'gold',
        bold: true
    },
    duration: 5
}, {
    display: {
        text: 'Hello world!',
        color: 'white',
        bold: false
    },
    duration: 5
}]);
```

![Example 4](https://raw.githubusercontent.com/ncklwse/sandstone-scoreboard/main/examples/example4.gif)

You can also animate lines in a similar way:

```ts
myScoreboard.addLine('').animate([{
    display: {
        text: 'Animated'
    },
    duration: 10
}, {
    display: {
        text: 'Line!'
    },
    duration: 10
}])
```

# License

Copyright &copy; 2021 [Nickelwise](https://github.com/ncklwse).

Licensed [MIT](https://github.com/ncklwse/sandstone-scoreboard/blob/master/LICENSE)
