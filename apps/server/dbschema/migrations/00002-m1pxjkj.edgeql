CREATE MIGRATION m1pxjkj4raw2wwyq6mr2w4a7yx4nm5phyxbtzfepl6sp7q7wxx7hiq
    ONTO m1chhklpva45gzkf7bhayvkzxlewnmmvgwh6ghgivwra6yjphe4zpq
{
  CREATE TYPE default::Movie {
      CREATE REQUIRED PROPERTY created_at: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE REQUIRED PROPERTY director: std::str;
      CREATE REQUIRED PROPERTY title: std::str;
      CREATE REQUIRED PROPERTY year: std::int16;
  };
};
