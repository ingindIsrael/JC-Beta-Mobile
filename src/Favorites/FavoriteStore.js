import { AsyncStorage } from 'react-native'

/**
 * @typedef {import('../definitions').NewsItem} NewsItem
 */
import isNewsItem from '../utils/isNewsItem'


/**
 * @type {Function[]}
 */
const subscribers = []

const notifySubscribers = () => {
  subscribers.forEach(subscriber => {
    subscriber()
  })
}

/**
 *
 * @param {Function} fn 
 */
export const subscribe = (fn) => {
  subscribers.push(fn)
}

/**
 *
 * @param {Function} fn 
 */
export const unsubscribe = (fn) => {
  subscribers.splice(subscribers.indexOf(fn), 1)
}

subscribe(() => {
  if (__DEV__) {
    AsyncStorage.getAllKeys().then(keys => {
      console.warn(`favs is now of length: ${keys.length}`)
    })
  }
})


/**
 * 
 * @param {NewsItem} newsItem 
 * @returns {Promise<void>}
 */
export const saveNewsItem = async (newsItem) => {
  isNewsItem(newsItem, 0, [])

  if (__DEV__) {
    console.warn(`add ${newsItem.id} to favorites`)
  }

  const key = newsItem.id.toString()

  const alreadyExists = await AsyncStorage.getItem(key) !== null

  if (alreadyExists) {
    throw new Error(
      `trying to save to favorites an article already in it, this is probably an interface error, the app is showing a save favorite icon somewhere even though the article is already saved`
    )
  }

  const json = JSON.stringify(newsItem)

  return AsyncStorage
    .setItem(key, json)
    .then(notifySubscribers)
}

/**
 * 
 * @param {number} id 
 */
export const removeNewsItem = async (id) => {
  if (!detectFavorite(id)) {
    throw new Error(
      'trying to remove a news item from favorites even though it isnt on favorites'
    )
  }

  return AsyncStorage.removeItem(id.toString())
}

/**
 * @returns {Promise<NewsItem[]>} NewsItems saved in async storage as favorites
 */
export const getAllFavorites = async () => {
  const keys = await AsyncStorage.getAllKeys()
  
  if (!Array.isArray(keys)) {
    throw new Error(
      `Expected an array of keys from AsyncStorage, got instead a ${typeof keys}`
    )
  }

  if (!keys.every(key => typeof key == 'string')) {
    throw new Error(
      'Expected an array of keys from AsyncStorage, got another type in the array'
    )
  }

  /**
   * @type {ReadonlyArray<string|null>}
   */
  const itemsJson = await Promise.all(
    keys
      .map(key => AsyncStorage.getItem(key))
  )

  if (!itemsJson.every(itemJson => typeof itemJson == 'string')) {
    throw new Error(
      'Expected an array of json strings from AsyncStorage, got another type in the array'
    )
  }

  /**
   * @type {NewsItem[]}
   */
  const items = itemsJson.map((json) => {
    // we already checked their all strings
    return JSON.parse(/** @type {string}*/ (json))
  })

  if (!items.every(isNewsItem)) {
    throw new Error()
  }

  return items
}


/**
 * 
 * @param {number} id Unique id of the news item to get
 * @returns {Promise<NewsItem>}
 */
export const getSavedNewsItem = async (id) => {
  const key = id.toString()

  const json = await AsyncStorage.getItem(key)

  if (json === null) {
    throw new Error(
      `trying to get a news item from the favorites which isnt in there` 
    )
  }

  const obj = JSON.parse(json)

  isNewsItem(obj, 0, [])

  return /** @type {NewsItem} */ (obj)
}


/**
 * 
 * @param {number} id 
 */
export const detectFavorite = async (id) => {
  try {
    if (__DEV__) {
      console.warn(
        `Checking if item id ${id} is favorite...`
      )
    }
    await getSavedNewsItem(id)
    if (__DEV__) {
      console.warn(
        `Item id ${id} is indeed favorite`
      )
    }
    return true
  } catch (e) {
    if (__DEV__) {
      console.warn(e.message)
    }
    return false
  }
}