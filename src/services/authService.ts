import Login from "../login/Login.ts";

class AuthService {
    //login com username e password
    public static async login(username: string, password: string): Promise<boolean> {
        const login = new Login(username, password);
        if (login.login()) {
            return true;
        } else {
            return false;
        }
    }
    


    public static logout(login: Login): void {
        login.logout();
    }

    public static changePassword(login: Login, newPassword: string): boolean {
        return login.changePassword(newPassword);
    }
}

export default AuthService;
