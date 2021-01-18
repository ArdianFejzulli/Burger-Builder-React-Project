import axios from 'axios';
import * as actionTypes from './actionTypes';

//sync
export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    }
}

//sync
export const authSuccess = (token, userId) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        idToken: token,
        userId: userId
    }
}

//sync
export const authFail = (error) => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    }
}

//Async now managed from REDUX SAGA
export const logout = () => {
    // localStorage.removeItem('token');
    // localStorage.removeItem('expirationDate');  
    // localStorage.removeItem('userId');  
    return {
        type: actionTypes.AUTH_INITIATE_LOGOUT,
    }
}
//Async WITH SAGA now is sync
export const logoutSaga = () => {
    return {
        type: actionTypes.AUTH_LOGOUT
    }
}


//Async
export const checkAuthTimeout = (expirationTime) => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationTime * 1000);
    };
}

//Async
export const auth = (email, password, isSignup, ) => {
    return dispatch => {
        dispatch(authStart());

        const authData = {
            email: email,
            password: password,
            returnSecureToken: true
        }

        let url = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBbUNvR3D-mRartA7QuIo-VVb44ekh2sXE';
        if(!isSignup) {
            url = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBbUNvR3D-mRartA7QuIo-VVb44ekh2sXE';
        }
        
        axios.post(url, authData)
            .then(response => {
                const expirationDate = new Date (new Date().getTime() + response.data.expiresIn * 1000);
                localStorage.setItem('token', response.data.idToken);
                localStorage.setItem('expirationDate', expirationDate);
                localStorage.setItem('userId', response.data.localId);
                dispatch(authSuccess(response.data.idToken, response.data.localId));
                dispatch(checkAuthTimeout(response.data.expiresIn));
            })
            .catch(err => {
                dispatch(authFail(err.response.data.error));
            })
    }
}

//sync
export const setAuthRedirectPath = (path) => {
    return {
        type: actionTypes.SET_AUTH_REDIRECT_PATH,
        path: path
    }
}

//Async
export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('token');
        if(!token) {
            dispatch(logout());
        } else {
            const expirationDate = new Date (localStorage.getItem('expirationDate'));
            if(expirationDate <= new Date()) {
                dispatch(logout());
            } else {
                const userId = localStorage.getItem('userId');
                dispatch(authSuccess(token, userId));  
                dispatch(checkAuthTimeout((expirationDate.getTime()- new Date().getTime()) / 1000 ));
            }
        }
    }
}