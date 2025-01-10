CREATE MIGRATION m1chhklpva45gzkf7bhayvkzxlewnmmvgwh6ghgivwra6yjphe4zpq
    ONTO initial
{
  CREATE TYPE default::Challenge {
      CREATE REQUIRED PROPERTY challenge: std::bytes;
      CREATE REQUIRED PROPERTY created_at: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY timeout: std::datetime;
  };
  CREATE TYPE default::User {
      CREATE REQUIRED PROPERTY created_at: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY updated_at: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY username: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::Challenge {
      CREATE REQUIRED LINK user: default::User;
  };
  CREATE TYPE default::Credential {
      CREATE REQUIRED LINK user: default::User {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY created_at: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY credential_id: std::bytes;
      CREATE REQUIRED PROPERTY public_key: std::bytes;
      CREATE REQUIRED PROPERTY sign_count: std::int64;
      CREATE REQUIRED PROPERTY transports: array<std::str>;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK credentials: default::Credential {
          ON TARGET DELETE ALLOW;
      };
  };
};
