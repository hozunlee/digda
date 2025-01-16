using extension auth;

# 스키마 변경 시 (cloud)
# edgedb migration create -I [your db] 
# 클라우드 적용
# edgedb migrate -I [your db] 
# 상태확인
# edgedb migration status -I [your db] 


module default {
type Movie {
  required property title -> str;
  required property year -> int16;
  required property director -> str;
  required property created_at -> datetime {
    default := datetime_current();
  };
}

  type User {
    # 사용자 이름
    required property username -> str {
      constraint exclusive;
    };
    # 생성 시간
    required property created_at -> datetime {
      default := datetime_current();
    };
    # 업데이트 시간
    required property updated_at -> datetime {
      default := datetime_current();
    };

    #webAuthn 인증 정보 연결
    multi link credentials -> Credential {
      on target delete allow;
    };
  }

# FIDO2/WebAuthn 인증 데이터 저장
  type Credential {
    required property credential_id -> bytes;  # 인증 고유 ID
    required property public_key -> bytes;     # 공개키
    required property sign_count -> int64;     # 인증 횟수
    required property transports -> array<str>; # 전송 방식
    required link user -> User {
      constraint exclusive;
    };
    required property created_at -> datetime {
      default := datetime_current();
    };
  }

# 인증 과정
  type Challenge {
    required property challenge -> bytes;    # 챌린지 데이터
    required property timeout -> datetime;   # 만료 시간
    required link user -> User;             # 사용자 연결
    required property created_at -> datetime {
      default := datetime_current();
    };
  }
}