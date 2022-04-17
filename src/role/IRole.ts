interface IRole {
  role:string;
  working:boolean;
  doDefaultWork():void;
  isReady():boolean;
  isWorking():boolean;
}