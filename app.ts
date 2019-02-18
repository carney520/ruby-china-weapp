//app.ts
export interface IMyApp {
  globalData: {}
}

App<IMyApp>({
  async onLaunch() {
  },
  globalData: {}
})
