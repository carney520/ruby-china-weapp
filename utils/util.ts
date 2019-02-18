/**
 * 可重入的promise
 */
export function reenterablePromise<R>(
  callback: () => Promise<R>
): () => Promise<R> {
  let pendingRequest: Array<[Function, Function]> = []
  let requesting: boolean = false

  return () =>
    new Promise((res, rej) => {
      if (requesting) {
        pendingRequest.push([res, rej])
        return
      }

      requesting = true

      callback().then(
        result => {
          requesting = false
          res(result)
          const list = pendingRequest
          pendingRequest = []
          list.forEach(i => i[0](result))
        },
        err => {
          requesting = false
          rej(err)
          const list = pendingRequest
          pendingRequest = []
          list.forEach(i => i[1](err))
        }
      )
    })
}
