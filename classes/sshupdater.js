const fs = require('fs')
const path = require('path')
const {NodeSSH} = require('node-ssh')



class sshUpdater {
    constructor(ip, port, username, password) {
        this.ip = ip;
        this.port = port;
        this.username = username;
        this.password = password;
        this.ssh = new NodeSSH();
    }

    async vicsUpdate() {
        try {
            // SSH 연결 설정
            await this.ssh.connect({
              host: this.ip, // 접속할 서버 주소
              port: this.port,
              username: this.username, // SSH 사용자 이름
              password: this.password // 서버 접속 비밀번호
            });
        
            
           await this.ssh.execCommand(`echo ${this.password} | sudo systemctl stop mivicsd.service`);
           console.log("mivics service stopped !!")
      
          // 로컬 파일 읽기
          const localFilePath = '/upload/vics'; // 로컬 파일 경로
          const localFileContent = fs.readFileSync(localFilePath);
      
          // 원격 서버로 파일 전송
          const remoteFilePath = '/home/mirero/VICS'; // 원격 서버 파일 경로
          await this.ssh.putFile(localFilePath, remoteFilePath), {
            overwrite: true
          };
      
          console.log("file transfer end")
      
          await this.ssh.execCommand(`echo ${this.password} | sudo systemctl start mivicsd.service`);
          console.log("mivics service stopped !!")
      
      
          } catch (err) {
            console.error('오류:', err);
          } finally {
            // SSH 연결 종료
            this.ssh.dispose();
          }
    }

}

module.exports = sshUpdater;