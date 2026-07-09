export interface MoodleResponse {
  exception?: string;
  errorcode?: string;
  message?: string;
  debuginfo?: string;
}

export interface MoodleUser extends MoodleResponse {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  email: string;
  profileimageurl: string;
  profileimageurlsmall: string;
  roles?: {
    roleid: number;
    name: string;
    shortname: string;
    sortorder: number;
  }[];
}

export interface MoodleCourse extends MoodleResponse {
  id: number;
  shortname: string;
  fullname: string;
  displayname: string;
  enrolledusercount: number;
  idnumber: string;
  visible: number;
  summary: string;
  summaryformat: number;
  format: string;
  showgrades: number;
  lang: string;
  enablecompletion: boolean;
  completionhascriteria: boolean;
  completionusertracked: boolean;
  category: number;
  progress?: number;
  completed?: boolean;
  startdate: number;
  enddate: number;
  marker: number;
  lastaccess: number;
  iscore: boolean;
  courseimage: string;
  sortorder: number;
  hasactivitygroups: boolean;
  hasgrades: boolean;
  ismonitored: boolean;
  overviewfiles: {
    filename: string;
    filepath: string;
    filesize: number;
    fileurl: string;
    timemodified: number;
    mimetype: string;
  }[];
}

export interface MoodleAuthResponse extends MoodleResponse {
  token: string;
  privatetoken?: string;
}
