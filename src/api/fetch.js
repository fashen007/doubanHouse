const axios = require('axios');
export const getHousData = async (arg = {}) => {
  let data = await axios.get('/api/doubanList', {
    params: arg
  })
  console.log('data', data)
  return data
}
export const spiderData = async (arg = {}) => {
  let respones = await axios.get('/api/getDataFromDouBan/', {
    params: arg
  })
  return respones.data
}
 