const axios = require('axios');
export const getHousData = async (arg = {}) => {
  let respones = await axios.get('/api/doubanList', {
    params: arg
  })
  return respones.data
}
export const spiderData = async (arg = {}) => {
  let respones = await axios.get('/api/getDataFromDouBan/', {
    params: arg
  })
  return respones.data
}
 
export const updateIps = async (arg = {}) => {
  let respones = await axios.get('/api/updateIps/', {
    params: arg
  })
  return respones.data
}
 
export const getIps = async (arg = {}) => {
  let respones = await axios.get('/api/getIps/', {
    params: arg
  })
  return respones.data
}
 