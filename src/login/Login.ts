class Login{
    private username: string;
    private password: string;
    constructor(username: string, password: string){
        this.username = username;
        this.password = password;
    }
    public authenticate(): boolean{
        return this.username === "admin" && this.password === "admin";
    }
    public getUsername(): string {
        return this.username;
    }

    public getPassword(): string {
        return this.password;
    }

    public setUsername(username: string): void {
        this.username = username;
    }

    public setPassword(password: string): void {
        this.password = password;
    }

    public isValid(): boolean {
        return this.username.length > 0 && this.password.length > 0;
    }
    
    public static fromJson(json: any): Login {
        return new Login(json.username, json.password);
    }

    public toJson(): any {
        return {
            username: this.username,
            password: this.password
        };
    }
    
    public clear(): void {
        this.username = "";
        this.password = "";
    }
    
    public login(): boolean {
        if (this.isValid() && this.authenticate()) {
            return true;
        }
        return false;
    }
    public logout(): void {
        this.clear();
    }
    
    public changePassword(newPassword: string): boolean {
        if (this.authenticate()) {
            this.setPassword(newPassword);
            return true;
        }
        return false;
    }
}

export default Login;