export default {
  plugins: {
    'postcss-nesting': {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: { preset: 'default' } } : {}),
  },
};
