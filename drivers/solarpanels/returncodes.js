const returncodes = {
Code_0  : 'Succeed to request',
Code_1000 : 'Data exception.',
Code_1001 : 'No data.',
Code_2000 : 'Application account exception.',
Code_2001 : 'Invalid application account.',
Code_2002 : 'The application account is not authorized.',
Code_2003 : 'Application account authorization expires.',
Code_2004 : 'The application account has no permission.',
Code_2005 : 'The access limit of the application account was exceeded.',
Code_3000 : 'Access token exception.',
Code_3001 : 'Missing Access token.',
Code_3002 : 'Unable to verify Access token.',
Code_3003 : 'Access token timeout.',
Code_3004 : 'Refresh token timeout.',
Code_4000 : 'Request parameter exception.',
Code_4001 : 'Invalid request parameter.',
Code_5000 : 'Internal server exception.',
Code_6000 : 'Communication exception.',
Code_7000 : 'Server access restriction exception.',
Code_7001 : 'Server access limit exceeded.',
Code_7002 : 'Too many requests, please request later.',
Code_7003 : 'The system is busy, please request later.'
};

module.exports = returncodes;