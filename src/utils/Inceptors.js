//This is where we will configure our interceptor

//request
const requestInterceptor = (axoisInstance) => {
  axoisInstance.interceptors.request.use(
    (config) => {
      return config;
    },
    (err) => {
      return new Promise.reject(err);
    },
  );
};

//response
const responeInterceptor = (axoisInstance) => {
  axoisInstance.interceptors.response.use(
    (config) => {
      return config;
    },
    (err) => {
      return new Promise.reject(err);
    },
  );
};

export { requestInterceptor, responeInterceptor };
