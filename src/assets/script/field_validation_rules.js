import { extend } from 'vee-validate';
import { required, email, alpha, alpha_dash, regex, alpha_num, oneOf, max } from 'vee-validate/dist/rules';

// Vee-validate
extend('required', {
  ...required,
  message: 'This field is required. '
});
extend('alpha', {
  ...alpha,
  message: 'Only use alphabetic characters.'
});
extend('alpha_num', {
  ...alpha_num,
  message: 'Only use alphabetic characters and numbers.'
});
extend('alpha_dash', {
  ...alpha_dash,
  message: 'Only use alphabetic characters, numbers, dashes or underscores.'
});
extend('email', {
  ...email,
  message: 'Please provide a valid email.'
});
extend('regex', {
  ...regex,
});
extend('max', {
  ...max,
  message: 'This field is too long.'
});
extend('oneOf', {
  ...oneOf,
  message: 'Please select one from the list.'
});
extend('password', {
  params: ['target'],
  validate(value, { target }) {
    return value === target;
  },
  message: 'Password confirmation does not match.'
});
extend('password_strength', {
  validate(value) {
    const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})")
    return regex.test(value)
  },
  message: "Password must have a minimum of 8 characters with at least 1 lower case, 1 upper case and 1 digit."
});
extend('end_date', {
  params: ['target'],
  validate(value, { target }) {
    // Remove hours
    return value.setHours(0,0,0,0) >= target.setHours(0,0,0,0)
  },
  message: 'End Date must be later than the Start Date.'
})
extend('twitter', {
  validate(value) {
    // Trim off the leading @ symbol, if there's any
    const str = value.trim().replace(/^@/, '')
    const regex = /[a-zA-Z0-9_]{1,15}/
    return regex.test(str)
  },
  message: "Invalid twitter handle."
})