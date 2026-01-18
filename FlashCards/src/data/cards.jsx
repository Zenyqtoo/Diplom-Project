const makeLetterImage = (text, bg = "#ffd166") =>
  `-/${bg.slice(1)}/ffffff?text=${encodeURIComponent(text)}`;

export const CATEGORIES = {
  alphabet: {
    id: "alphabet",
    title: "Alphabet",
    color: "#ff7aa2",
    cards: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((ch) => ({
      id: `alpha-${ch}`,
      imageUrl: makeLetterImage(ch, "#ffd166"),
      label: ch,
      speak: ch
    }))
  },
  numbers: {
    id: "numbers",
    title: "Numbers",
    color: "#4cc9f0",
    cards: Array.from({ length: 10 }, (_, i) => {
      const n = String(i);
      return {
        id: `num-${n}`,
        imageUrl: `-${n}`,
        label: n,
        speak: n
      };
    })
  },
  animals: {
    id: "animals",
    title: "Animals",
    color: "#ffd166",
    cards: [
      { id: "a-cat", label: "Cat", imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&q=80", speak: "Cat" },
      { id: "a-dog", label: "Dog", imageUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=1200&q=80", speak: "Dog" },
      { id: "a-bird", label: "Bird", imageUrl: "https://plus.unsplash.com/premium_photo-1674487959493-8894cc9473ea?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmlyZHxlbnwwfHwwfHx8MA%3D%3D", speak: "Bird" }
    ]
  },
  colors: {
    id: "colors",
    title: "Colors",
    color: "#ffd6a5",
    cards: [
      { id: "c-red", label: "Red", imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQIAAACUCAMAAABP2deIAAAADFBMVEX/AQHWAwLhAQH/AwZ3o5idAAAAQ0lEQVR4nO3BgQ0AMAgDoE7//3lvmBTIq5etFwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM6Zeh9CrAYNsyG7VgAAAABJRU5ErkJggg==", speak: "Red" },
      { id: "c-blue", label: "Blue", imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANEAAACUCAMAAAA6cTwCAAAAA1BMVEUTOJ0gO3PxAAAANUlEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4GeWgAAXsYEccAAAAASUVORK5CYII=", speak: "Blue" },
      { id: "c-green", label: "Green", imageUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACoCAMAAABt9SM9AAAAA1BMVEUAZACm65N5AAAAR0lEQVR4nO3BAQEAAACCIP+vbkhAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAO8GxYgAAb0jQ/cAAAAASUVORK5CYII=", speak: "Green" }
    ]
  }
};