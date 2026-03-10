// students.js
// Three student objects with methods: getFullName, getAVGScore, getFullBirthday, getAge

const student1 = {
  name: "Ngoc",
  middle: "Ngoc",
  family: "Nguyen",
  birth: { year: 2003, month: 5, day: 12 },
  scores: [8, 9, 7],
  getFullName: function () {
    return `${this.family} ${this.middle} ${this.name}`;
  },
  getAVGScore: function () {
    return this.scores.reduce((s, e) => s + e, 0) / this.scores.length;
  },
  getFullBirthday: function () {
    return `${this.birth.day}/${this.birth.month}/${this.birth.year}`;
  },
  getAge: function () {
    const today = new Date();
    let age = today.getFullYear() - this.birth.year;
    const m = today.getMonth() + 1; // JS months: 0-11
    const d = today.getDate();
    if (m < this.birth.month || (m === this.birth.month && d < this.birth.day)) age--;
    return age;
  },
};

const student2 = {
  name: "An",
  middle: "Minh",
  family: "Tran",
  birth: { year: 2004, month: 11, day: 2 },
  scores: [9, 8.5, 10],
  getFullName: function () {
    return `${this.family} ${this.middle} ${this.name}`;
  },
  getAVGScore: function () {
    return this.scores.reduce((s, e) => s + e, 0) / this.scores.length;
  },
  getFullBirthday: function () {
    return `${this.birth.day}/${this.birth.month}/${this.birth.year}`;
  },
  getAge: function () {
    const today = new Date();
    let age = today.getFullYear() - this.birth.year;
    const m = today.getMonth() + 1;
    const d = today.getDate();
    if (m < this.birth.month || (m === this.birth.month && d < this.birth.day)) age--;
    return age;
  },
};

const student3 = {
  name: "Tung",
  middle: "Van",
  family: "Le",
  birth: { year: 2002, month: 1, day: 20 },
  scores: [7, 6.5, 8],
  getFullName: function () {
    return `${this.family} ${this.middle} ${this.name}`;
  },
  getAVGScore: function () {
    return this.scores.reduce((s, e) => s + e, 0) / this.scores.length;
  },
  getFullBirthday: function () {
    return `${this.birth.day}/${this.birth.month}/${this.birth.year}`;
  },
  getAge: function () {
    const today = new Date();
    let age = today.getFullYear() - this.birth.year;
    const m = today.getMonth() + 1;
    const d = today.getDate();
    if (m < this.birth.month || (m === this.birth.month && d < this.birth.day)) age--;
    return age;
  },
};

// Export for use in other modules/tests
module.exports = { student1, student2, student3 };

// Demo output when run with `node students.js`
if (require.main === module) {
  [student1, student2, student3].forEach((s, i) => {
    console.log(`Student ${i + 1}:`);
    console.log("  Full name:", s.getFullName());
    console.log("  Birthday:", s.getFullBirthday());
    console.log("  Age:", s.getAge());
    console.log("  Average score:", s.getAVGScore());
    console.log();
  });
}
