# sandstone-scoreboard

Create complex custom scoreboards with scoreboards with ease!

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

// Lines only support the text and color properties (for now)
const myLine = new Line({
    text: 'Hello world!',
    color: 'white'
});

// Adding the line to the scoreboard
myScoreboard.addLine(myLine);
```

Lines *must* contain at least one non-whitespace character, because of how this library was created. This library works by adding this non-whitespace character to the scoreboard as a player, with all other text being used as prefixes/suffixes on a team to which the scoreboard player is assigned.

```ts
// Adds a player called "Hello", assigned to a team with the suffix " world!"
myScoreboard.addLine(new Line({
    text: 'a',
    color: 'white'
}));

// Throws error
myScoreboard.addLine(new Line({
    text: ' ',
    color: 'white'
}));
```

Additionally, if you have too many similar lines of text added to the same scoreboard from which different player names can't be generated, the code won't compile because the same player can't be added to a scoreboard twice.

```ts
// Adds a player called "test"
myScoreboard.addLine(new Line({
    text: 'test',
    color: 'white'
}));

// Adds a player called "tes"
myScoreboard.addLine(new Line({
    text: 'test',
    color: 'white'
}));

// Adds a player called "a"
myScoreboard.addLine(new Line({
    text: 'a',
    color: 'white'
}));

// Throws error
myScoreboard.addLine(new Line({
    text: 'a',
    color: 'white'
}));
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

const myLine = new Line([{
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

myScoreboard.addLine(myLine);
```

Like scoreboards, lines aren't tied to any specific MCFunction, meaning you can export them and use them across multiple files. Additionally, lines can be used in different scoreboard and can be added to the same scoreboard multiple times!

```ts
// Adding a line to a scoreboard
myScoreboard.addLine(myLine);

// Adding a line multiple times to the same scoreboard
myOtherScoreboard.addLine(myLine);
myOtherScoreboard.addLine(myLine);
```

When adding a line, you can also specify a priority. The higher the priority, the higher the line will appear on the scoreboard. The default priority on all lines when they're added is 0.

```ts
const line1 = new Line({
    text: 'Added first'
});

const line1 = new Line({
    text: 'Added second'
});

const line1 = new Line({
    text: 'Added third, but with priority'
});

myScoreboard.addLine(line1);
myScoreboard.addLine(line2);
myScoreboard.addLine(line3, 2);
```

To remove a line from your scoreboard, use the same line instance you passed when you added it. This will remove all instances of that line from the scoreboard.

```ts
// Add the same line twice
myScoreboard.addLine(myLine);
myScoreboard.addLine(myLine);

// Remove both lines at once using the same line instance
myScoreboard.removeLine(myLine);
```

To update a line on a scoreboard, just update the original line instance. This change will be automatically be reflected across all the scoreboards it's been added to.

```ts
myLine.update({
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

You can also show/hide your scoreboard to a specific team color:

```ts
// Show your scoreboard to teams with a color of red:
myScoreboard.show('red');
```

One of the features which I'm most proud of is the ability to animate scoreboard objectives, which can be done using the `.animate()` method. The sole argument is a JSON Text Component, with the added `delay` property. The delay is specified in ticks, with the default being 20.

```ts
myScoreboard.animate([{
    text: 'Hello world!',
    color: 'white',
    bold: false,
    delay: 5
}, {
    text: 'Hello world!',
    color: 'gold',
    bold: true,
    delay: 5
}]);
```
Preview screenshots/gifs coming soon...

# License

Copyright &copy; 2021 [ncklwse](https://github.com/ncklwse).

Licensed [MIT](https://github.com/ncklwse/sandstone-scoreboard/blob/master/LICENSE)