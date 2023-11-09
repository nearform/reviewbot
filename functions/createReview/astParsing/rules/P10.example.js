const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("foo")
  }, 300)
})

async function test1() {
  for(let i = 0 ; i < 10 ; i++) {
    // expect:P10
    await myPromise()
  }
}

async function test2() {
  for(let i = 0 ; i < 10 ; i++) {
    // expect:P10
    await myPromise()
  }
}

async function test3() {
  for(let i = 0 ; i < 10 ; i++) {
    // expect:P10
    await myPromise()
  }
}

// function test2() {
//   [1,2,3].map(async () => await myPromise())
// }

// function test3() {

//   [1,2,3].map(async () => await myPromise())

// }