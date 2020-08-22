export enum StatuOrderEnum {
  pending = 1,
  awaitingUserChoseStore = 2,
  separation = 3,
  ready = 4,
  canceledForStoreTimeout = 5,
}

export enum StatusShopOrderEnum {
  awaitingStore = 1,
  acceptOrder = 2,
  awaitingUser = 3,
  canceledForTimeout = 4,
  refused = 5,
}
