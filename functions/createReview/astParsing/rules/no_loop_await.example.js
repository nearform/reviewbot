const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("foo")
  }, 300)
})

async function testFor() {
  for(let i = 0 ; i < 10 ; i++) {
    // expect:no_loop_await
    await myPromise()
  }
}

async function testForOf() {
  const promises = [myPromise, myPromise]
  for(let promise of promises) {
    // expect:no_loop_await
    await promise()
  }
}

async function testForIn() {
  const promises = [myPromise, myPromise]
  for(let i in promises) {
    // expect:no_loop_await
    await promises[i]()
  }
}

async function testWhile() {
  let i = 0;
  while(i < 10) {
    // expect:no_loop_await
    await myPromise()
    i++
  }
}

async function testDoWhile() {
  let i = 0;
  do {
    // expect:no_loop_await
    await myPromise()
    i++
  } while(i < 10)
}

function testArrayMap() {
  // expect:no_loop_await
  [1,2,3].map(async () => await myPromise())
}

async function testArrayForEach() {
  const promises = [myPromise, myPromise]
  // expect:no_loop_await
  promises.forEach(async promise => await promise())
}