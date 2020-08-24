export enum StatuOrderEnum {
  pending = 1,
  awaitingUserChoseStore = 2,
  separation = 3,
  ready = 4,
  canceledForStoreTimeout = 5,
  refusedByClient = 6,
}

export enum StatusShopOrderEnum {
  awaitingStore = 1,
  acceptOrder = 2,
  awaitingUser = 3,
  canceledForTimeout = 4,
  refused = 5,
  acceptByClient = 6,
  refusedByClient = 7,
}
